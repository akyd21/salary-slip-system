package com.salaryslip.utility;

import com.salaryslip.entity.SalaryRecord;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Component
public class ExcelParserUtil {

    /**
     * Parse Excel (.xlsx) file and return list of SalaryRecord objects
     */
    public List<SalaryRecord> parseExcel(MultipartFile file) throws Exception {
        List<SalaryRecord> records = new ArrayList<>();
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        // Skip header row (row 0), start from row 1
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            SalaryRecord record = new SalaryRecord();
            record.setEmployeeId(getCellValue(row.getCell(0)));
            record.setBaseSalary(Double.parseDouble(getCellValue(row.getCell(1))));
            record.setHra(Double.parseDouble(getCellValue(row.getCell(2))));
            record.setAllowances(Double.parseDouble(getCellValue(row.getCell(3))));
            record.setDeductions(Double.parseDouble(getCellValue(row.getCell(4))));
            record.setMonth(getCellValue(row.getCell(5)));
            record.setStatus("PENDING");
            records.add(record);
        }
        workbook.close();
        return records;
    }

    /**
     * Parse CSV file and return list of SalaryRecord objects
     */
    public List<SalaryRecord> parseCsv(MultipartFile file) throws Exception {
        List<SalaryRecord> records = new ArrayList<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
        String line;
        boolean firstLine = true;

        while ((line = reader.readLine()) != null) {
            if (firstLine) { firstLine = false; continue; } // skip header
            String[] cols = line.split(",");
            if (cols.length < 6) continue;

            SalaryRecord record = new SalaryRecord();
            record.setEmployeeId(cols[0].trim());
            record.setBaseSalary(Double.parseDouble(cols[1].trim()));
            record.setHra(Double.parseDouble(cols[2].trim()));
            record.setAllowances(Double.parseDouble(cols[3].trim()));
            record.setDeductions(Double.parseDouble(cols[4].trim()));
            record.setMonth(cols[5].trim());
            record.setStatus("PENDING");
            records.add(record);
        }
        return records;
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case NUMERIC: return String.valueOf((long) cell.getNumericCellValue());
            case STRING:  return cell.getStringCellValue().trim();
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            default:      return "";
        }
    }
}
