package com.salaryslip.dto;
import lombok.Data;
import java.util.List;
@Data
public class DispatchResultDTO {
    private int totalProcessed;
    private int successCount;
    private int failureCount;
    private List<String> failedEmployees;
    private String message;
}
