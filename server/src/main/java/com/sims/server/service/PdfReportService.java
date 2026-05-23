package com.sims.server.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.sims.server.model.Student;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@Service
public class PdfReportService {

    private static final DeviceRgb HEADER_BG = new DeviceRgb(24, 24, 27);   // zinc-900
    private static final DeviceRgb ROW_ALT   = new DeviceRgb(250, 250, 250); // zinc-50

    public byte[] generateStudentListPdf(List<Student> students, String title) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document doc = new Document(pdf, PageSize.A4.rotate());
        doc.setMargins(30, 30, 30, 30);

        try {
            PdfFont bold = PdfFontFactory.createFont("Helvetica-Bold");
            PdfFont regular = PdfFontFactory.createFont("Helvetica");

            // Title
            doc.add(new Paragraph("Student Information Management System")
                    .setFont(bold).setFontSize(14).setFontColor(ColorConstants.BLACK)
                    .setTextAlignment(TextAlignment.CENTER));

            doc.add(new Paragraph(title)
                    .setFont(regular).setFontSize(10)
                    .setFontColor(new DeviceRgb(113, 113, 122))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(4));

            doc.add(new Paragraph("Generated: " + LocalDate.now())
                    .setFont(regular).setFontSize(8)
                    .setFontColor(new DeviceRgb(161, 161, 170))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(16));

            // Table
            float[] colWidths = {60, 160, 80, 60, 80, 60, 100, 100};
            Table table = new Table(UnitValue.createPointArray(colWidths));
            table.setWidth(UnitValue.createPercentValue(100));

            String[] headers = {"Adm. No", "Full Name", "Grade", "Gender", "Stream", "Medium", "Contact", "Parent Contact"};
            for (String h : headers) {
                table.addHeaderCell(
                        new Cell().add(new Paragraph(h).setFont(bold).setFontSize(8)
                                .setFontColor(ColorConstants.WHITE))
                                .setBackgroundColor(HEADER_BG)
                                .setPadding(5));
            }

            for (int i = 0; i < students.size(); i++) {
                Student s = students.get(i);
                DeviceRgb bg = (i % 2 == 1) ? ROW_ALT : null;
                String[] cells = {
                        nvl(s.getAdmissionNumber()),
                        nvl(s.getFullName()),
                        nvl(s.getGrade()),
                        nvl(s.getGender()),
                        nvl(s.getStream()),
                        nvl(s.getMedium()),
                        nvl(s.getContactNumber()),
                        nvl(s.getParentContactNumber()),
                };
                for (String val : cells) {
                    Cell cell = new Cell().add(new Paragraph(val).setFont(regular).setFontSize(8)).setPadding(4);
                    if (bg != null) cell.setBackgroundColor(bg);
                    table.addCell(cell);
                }
            }

            doc.add(table);

            doc.add(new Paragraph("Total records: " + students.size())
                    .setFont(regular).setFontSize(8)
                    .setFontColor(new DeviceRgb(113, 113, 122))
                    .setMarginTop(10));

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        } finally {
            doc.close();
        }
        return out.toByteArray();
    }

    private String nvl(String val) {
        return val != null ? val : "";
    }
}
