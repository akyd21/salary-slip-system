package com.salaryslip.controller;

import com.salaryslip.dto.DispatchResultDTO;
import com.salaryslip.service.PayrollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    @Autowired
    private PayrollService payrollService;

    /**
     * POST /api/payroll/dispatch
     * Body: { "month": "May 2026", "passwordProtect": true }
     * Triggers PDF generation + email dispatch for all employees in given month.
     */
    @PostMapping("/dispatch")
    public ResponseEntity<DispatchResultDTO> dispatchSlips(@RequestBody Map<String, Object> body) {
        try {
            String  month           = (String)  body.getOrDefault("month", "");
            boolean passwordProtect = (Boolean) body.getOrDefault("passwordProtect", false);

            if (month.isBlank()) {
                DispatchResultDTO err = new DispatchResultDTO();
                err.setMessage("Month is required (e.g. 'May 2026')");
                return ResponseEntity.badRequest().body(err);
            }

            DispatchResultDTO result = payrollService.dispatchSalarySlips(month, passwordProtect);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            DispatchResultDTO err = new DispatchResultDTO();
            err.setMessage("Dispatch failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }
}
