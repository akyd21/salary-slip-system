package com.salaryslip.service;

import com.salaryslip.dto.*;
import com.salaryslip.entity.Employee;
import com.salaryslip.entity.SalaryRecord;
import com.salaryslip.repository.EmployeeRepository;
import com.salaryslip.repository.SalaryRepository;
import com.salaryslip.utility.EmailUtil;
import com.salaryslip.utility.ExcelParserUtil;
import com.salaryslip.utility.PdfUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PayrollService {

    @Autowired private EmployeeRepository employeeRepo;
    @Autowired private SalaryRepository   salaryRepo;
    @Autowired private ExcelParserUtil    excelParser;
    @Autowired private PdfUtil            pdfUtil;
    @Autowired private EmailUtil          emailUtil;

    // ── Step 1: Parse uploaded file → build preview ──────────────────

    public UploadResponseDTO processUpload(MultipartFile file) throws Exception {
        List<SalaryRecord> rawRecords = parseFile(file);
        List<PreviewRowDTO> preview   = new ArrayList<>();
        int missing = 0;

        for (SalaryRecord raw : rawRecords) {
            PreviewRowDTO row = new PreviewRowDTO();
            row.setEmployeeId(raw.getEmployeeId());
            row.setBaseSalary(raw.getBaseSalary());
            row.setHra(raw.getHra());
            row.setAllowances(raw.getAllowances());
            row.setDeductions(raw.getDeductions());
            row.setMonth(raw.getMonth());
            row.setNetSalary(
                (raw.getBaseSalary() + raw.getHra() + raw.getAllowances()) - raw.getDeductions()
            );

            Optional<Employee> emp = employeeRepo.findByEmployeeId(raw.getEmployeeId());
            if (emp.isPresent()) {
                row.setName(emp.get().getName());
                row.setEmail(emp.get().getEmail());
                row.setDesignation(emp.get().getDesignation());
                row.setEmployeeFound(true);
            } else {
                row.setName("NOT FOUND");
                row.setEmployeeFound(false);
                missing++;
            }
            preview.add(row);
        }

        // ✅ FIX 1: Pehle us month ke purane/duplicate records delete karo
        if (!rawRecords.isEmpty()) {
            String month = rawRecords.get(0).getMonth();
            salaryRepo.deleteByMonth(month);
        }

        // Ab fresh records save karo
        salaryRepo.saveAll(rawRecords);

        UploadResponseDTO response = new UploadResponseDTO();
        response.setSuccess(true);
        response.setMessage("File parsed successfully. Review and confirm to dispatch.");
        response.setPreviewData(preview);
        response.setTotalRecords(rawRecords.size());
        response.setMissingEmployees(missing);
        return response;
    }

    // ── Step 2: Admin confirms → generate PDFs → send emails ─────────

    public DispatchResultDTO dispatchSalarySlips(String month, boolean passwordProtect) {
        // ✅ FIX 2: Sirf PENDING records lo — already SENT wale skip honge
        List<SalaryRecord> records = salaryRepo.findByMonthAndStatus(month, "PENDING");
        DispatchResultDTO result   = new DispatchResultDTO();
        List<String> failed        = new ArrayList<>();
        int success = 0, failure = 0;

        for (SalaryRecord record : records) {
            try {
                Optional<Employee> empOpt = employeeRepo.findByEmployeeId(record.getEmployeeId());
                if (empOpt.isEmpty()) { failed.add(record.getEmployeeId()); failure++; continue; }

                Employee emp = empOpt.get();

                // Build DTO for PDF
                SalarySlipDTO dto = buildSlipDTO(record, emp);

                // Generate PDF
                byte[] pdfBytes = pdfUtil.generateSalarySlipPdf(dto, passwordProtect);

                // Send email
                emailUtil.sendSalarySlipEmail(emp.getEmail(), emp.getName(), record.getMonth(), pdfBytes);

                // Mark as SENT
                record.setStatus("SENT");
                salaryRepo.save(record);
                success++;

            } catch (Exception e) {
                failed.add(record.getEmployeeId() + " (" + e.getMessage() + ")");
                failure++;
            }
        }

        result.setTotalProcessed(records.size());
        result.setSuccessCount(success);
        result.setFailureCount(failure);
        result.setFailedEmployees(failed);
        result.setMessage(success + " salary slips sent successfully. " + failure + " failed.");
        return result;
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private List<SalaryRecord> parseFile(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            return excelParser.parseExcel(file);
        } else if (filename.endsWith(".csv")) {
            return excelParser.parseCsv(file);
        }
        throw new IllegalArgumentException("Unsupported file format. Please upload .xlsx or .csv");
    }

    private SalarySlipDTO buildSlipDTO(SalaryRecord record, Employee emp) {
        SalarySlipDTO dto = new SalarySlipDTO();
        dto.setEmployeeId(emp.getEmployeeId());
        dto.setName(emp.getName());
        dto.setEmail(emp.getEmail());
        dto.setDesignation(emp.getDesignation());
        dto.setDepartment(emp.getDepartment());
        dto.setBirthYear(emp.getBirthYear());
        dto.setBaseSalary(record.getBaseSalary());
        dto.setHra(record.getHra());
        dto.setAllowances(record.getAllowances());
        dto.setDeductions(record.getDeductions());
        dto.setMonth(record.getMonth());
        dto.setNetSalary(
            (record.getBaseSalary() + record.getHra() + record.getAllowances()) - record.getDeductions()
        );
        return dto;
    }
}