package com.salaryslip.controller;

import com.salaryslip.entity.Employee;
import com.salaryslip.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepo;

    /** GET /api/employees — list all employees */
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeRepo.findAll());
    }

    /** POST /api/employees — add/register a new employee */
    @PostMapping
    public ResponseEntity<Employee> addEmployee(@RequestBody Employee employee) {
        Employee saved = employeeRepo.save(employee);
        return ResponseEntity.ok(saved);
    }

    /** DELETE /api/employees/{employeeId} */
    @DeleteMapping("/{employeeId}")
    public ResponseEntity<String> deleteEmployee(@PathVariable String employeeId) {
        employeeRepo.findByEmployeeId(employeeId).ifPresent(e -> employeeRepo.delete(e));
        return ResponseEntity.ok("Employee removed");
    }
}
