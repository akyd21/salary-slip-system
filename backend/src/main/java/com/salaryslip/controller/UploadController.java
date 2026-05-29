package com.salaryslip.controller;

import com.salaryslip.dto.UploadResponseDTO;
import com.salaryslip.service.PayrollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Autowired
    private PayrollService payrollService;

    /**
     * POST /api/upload/salary
     * Admin uploads salary CSV/Excel file.
     * Returns merged preview data (salary + employee info).
     */
    @PostMapping("/salary")
    public ResponseEntity<UploadResponseDTO> uploadSalaryFile(
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                UploadResponseDTO err = new UploadResponseDTO();
                err.setSuccess(false);
                err.setMessage("File is empty. Please upload a valid CSV or Excel file.");
                return ResponseEntity.badRequest().body(err);
            }
            UploadResponseDTO response = payrollService.processUpload(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            UploadResponseDTO err = new UploadResponseDTO();
            err.setSuccess(false);
            err.setMessage("Error processing file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }
}
