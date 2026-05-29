package com.salaryslip.dto;
import lombok.Data;
import java.util.List;
@Data
public class UploadResponseDTO {
    private boolean success;
    private String message;
    private List<PreviewRowDTO> previewData;
    private int totalRecords;
    private int missingEmployees;
}
