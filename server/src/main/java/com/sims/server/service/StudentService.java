package com.sims.server.service;

import com.opencsv.CSVReader;
import com.sims.server.model.Student;
import com.sims.server.repository.StudentRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    public List<Student> getAllStudents(String q, String grade, String stream) {
        if (q != null || grade != null || stream != null) {
            return studentRepository.searchStudents(q, grade, stream);
        }
        return studentRepository.findAll();
    }

    public void importStudents(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename();
        if (filename == null)
            throw new Exception("Invalid file");

        if (filename.endsWith(".csv")) {
            importCsv(file);
        } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            importExcel(file);
        } else {
            throw new Exception("Unsupported file format. Please upload CSV or Excel.");
        }
    }

    private void importCsv(MultipartFile file) throws Exception {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
                CSVReader csvReader = new CSVReader(reader)) {

            String[] header = csvReader.readNext(); // Skip header
            String[] line;
            List<Student> students = new ArrayList<>();

            while ((line = csvReader.readNext()) != null) {
                // Assuming validation happens here (basic check)
                if (line.length < 2)
                    continue;

                Student student = new Student();
                student.setAdmissionNumber(line[0]);
                student.setFullName(line[1]);
                student.setGrade(line.length > 2 ? line[2] : null);
                student.setStream(line.length > 3 ? line[3] : null);
                // Add other fields mappings as needed

                students.add(student);
            }
            studentRepository.saveAll(students);
        }
    }

    private void importExcel(MultipartFile file) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<Student> students = new ArrayList<>();

            for (Row row : sheet) {
                if (row.getRowNum() == 0)
                    continue; // Skip header

                Student student = new Student();
                // Basic cell reading (needs robust error handling in prod)
                try {
                    student.setAdmissionNumber(row.getCell(0).getStringCellValue());
                    student.setFullName(row.getCell(1).getStringCellValue());
                    // ... map other fields
                } catch (Exception e) {
                    // Skip bad row or log
                    continue;
                }
                students.add(student);
            }
            studentRepository.saveAll(students);
        }
    }

    public java.io.ByteArrayInputStream exportStudents(List<Student> students) {
        try (java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
                java.io.PrintWriter writer = new java.io.PrintWriter(out)) {

            // Header
            writer.println("ID,Admission Number,Full Name,Grade,Stream");

            for (Student student : students) {
                writer.printf("%s,%s,%s,%s,%s\n",
                        student.getId(),
                        escapeCsv(student.getAdmissionNumber()),
                        escapeCsv(student.getFullName()),
                        escapeCsv(student.getGrade()),
                        escapeCsv(student.getStream()));
            }
            writer.flush();
            return new java.io.ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Fail to import data to CSV file: " + e.getMessage());
        }
    }

    private String escapeCsv(String data) {
        if (data == null)
            return "";
        String escaped = data.replaceAll("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n")) {
            return "\"" + escaped + "\"";
        }
        return data;
    }
}
