package com.salaryslip.dto;
import lombok.Data;
@Data
public class PreviewRowDTO {
    private String employeeId;
    private String name;
    private String email;
    private String designation;
    private double baseSalary;
    private double hra;
    private double allowances;
    private double deductions;
    private double netSalary;
    private String month;
    private boolean employeeFound;
}
