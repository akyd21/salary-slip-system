package com.salaryslip.utility;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.salaryslip.dto.SalarySlipDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;

@Component
public class PdfUtil {

    @Value("${app.company.name:ABC Pvt Ltd}")
    private String companyName;

    private static final DeviceRgb HEADER_COLOR = new DeviceRgb(30, 58, 138);
    private static final DeviceRgb ACCENT_COLOR = new DeviceRgb(59, 130, 246);
    private static final DeviceRgb ROW_ALT_COLOR = new DeviceRgb(239, 246, 255);

    public byte[] generateSalarySlipPdf(SalarySlipDTO dto, boolean passwordProtect) throws Exception {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(baos);

        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont normal = PdfFontFactory.createFont(StandardFonts.HELVETICA);

        // Company Header
        Paragraph compHeader = new Paragraph(companyName)
                .setFont(bold)
                .setFontSize(22)
                .setFontColor(ColorConstants.WHITE)
                .setTextAlignment(TextAlignment.CENTER);

        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1}))
                .useAllAvailableWidth();

        Cell headerCell = new Cell()
                .add(compHeader)
                .setBackgroundColor(HEADER_COLOR)
                .setPadding(18);

        headerTable.addCell(headerCell);
        document.add(headerTable);

        // Salary Slip Title
        document.add(new Paragraph("SALARY SLIP - " + dto.getMonth().toUpperCase())
                .setFont(bold)
                .setFontSize(13)
                .setFontColor(ACCENT_COLOR)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(16)
                .setMarginBottom(12));

        // Employee Info
        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .useAllAvailableWidth()
                .setMarginBottom(16);

        addInfoRow(infoTable, "Employee ID", dto.getEmployeeId(), bold, normal, false);
        addInfoRow(infoTable, "Employee Name", dto.getName(), bold, normal, true);
        addInfoRow(infoTable, "Designation", dto.getDesignation(), bold, normal, false);
        addInfoRow(infoTable, "Department", dto.getDepartment(), bold, normal, true);
        addInfoRow(infoTable, "Pay Period", dto.getMonth(), bold, normal, false);

        document.add(infoTable);

        // Salary Breakdown
        document.add(new Paragraph("Salary Breakdown")
                .setFont(bold)
                .setFontSize(12)
                .setFontColor(HEADER_COLOR)
                .setMarginBottom(6));

        Table salaryTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                .useAllAvailableWidth();

        salaryTable.addHeaderCell(
                styledCell("Component", bold, HEADER_COLOR, ColorConstants.WHITE));

        salaryTable.addHeaderCell(
                styledCell("Amount (Rs)", bold, HEADER_COLOR, ColorConstants.WHITE));

        addSalaryRow(salaryTable, "Basic Salary", dto.getBaseSalary(), normal, false);
        addSalaryRow(salaryTable, "HRA", dto.getHra(), normal, true);
        addSalaryRow(salaryTable, "Allowances", dto.getAllowances(), normal, false);
        addSalaryRow(salaryTable, "Deductions", dto.getDeductions(), normal, true);

        document.add(salaryTable);

        // Net Salary
        double netSalary =
                dto.getBaseSalary()
                        + dto.getHra()
                        + dto.getAllowances()
                        - dto.getDeductions();

        Table netTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                .useAllAvailableWidth()
                .setMarginTop(15);

        netTable.addCell(
                styledCell("NET SALARY", bold, ACCENT_COLOR, ColorConstants.WHITE));

        netTable.addCell(
                styledCell(formatAmount(netSalary), bold, ACCENT_COLOR, ColorConstants.WHITE));

        document.add(netTable);

        // Footer
        document.add(new Paragraph(
                "This is a computer generated salary slip.\n" +
                "For queries contact HR Department.")
                .setFont(normal)
                .setFontSize(9)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(20));

        document.close();

        return baos.toByteArray();
    }

    private void addInfoRow(Table table,
                            String label,
                            String value,
                            PdfFont bold,
                            PdfFont normal,
                            boolean shaded) {

        DeviceRgb bg = shaded ? ROW_ALT_COLOR : null;

        Cell labelCell = new Cell()
                .add(new Paragraph(label).setFont(bold))
                .setPadding(6);

        Cell valueCell = new Cell()
                .add(new Paragraph(value == null ? "-" : value).setFont(normal))
                .setPadding(6);

        if (bg != null) {
            labelCell.setBackgroundColor(bg);
            valueCell.setBackgroundColor(bg);
        }

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addSalaryRow(Table table,
                              String component,
                              double amount,
                              PdfFont normal,
                              boolean shaded) {

        DeviceRgb bg = shaded ? ROW_ALT_COLOR : null;

        Cell componentCell = new Cell()
                .add(new Paragraph(component).setFont(normal))
                .setPadding(6);

        Cell amountCell = new Cell()
                .add(new Paragraph(formatAmount(amount))
                        .setFont(normal)
                        .setTextAlignment(TextAlignment.RIGHT))
                .setPadding(6);

        if (bg != null) {
            componentCell.setBackgroundColor(bg);
            amountCell.setBackgroundColor(bg);
        }

        table.addCell(componentCell);
        table.addCell(amountCell);
    }

    private Cell styledCell(String text,
                            PdfFont font,
                            DeviceRgb bg,
                            com.itextpdf.kernel.colors.Color fg) {

        return new Cell()
                .add(new Paragraph(text)
                        .setFont(font)
                        .setFontColor(fg))
                .setBackgroundColor(bg)
                .setPadding(8);
    }

    private String formatAmount(double amount) {
        return String.format("%,.2f", amount);
    }
}