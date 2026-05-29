package com.salaryslip.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Data
@Document(collection = "salaries")
public class SalaryRecord {
    @Id private String id;
    private String employeeId;
    private double baseSalary;
    private double hra;
    private double allowances;
    private double deductions;
    private String month;
    private String status = "PENDING";
}
