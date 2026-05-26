package com.sims.server.service;

import com.opencsv.CSVReader;
import com.sims.server.dto.ImportResultDTO;
import com.sims.server.model.Student;
import com.sims.server.repository.OLResultRepository;
import com.sims.server.repository.StudentRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private OLResultRepository olResultRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public List<Student> getAllStudents(String q, String grade, String stream) {
        return getAllStudents(q, grade, stream, null, null);
    }

    public List<Student> getAllStudents(String q, String grade, String alStream,
                                        String registrationStatus, String studentType) {
        if (q != null || grade != null || alStream != null
                || registrationStatus != null || studentType != null) {
            return studentRepository.searchStudents(q, grade, alStream, registrationStatus, studentType);
        }
        return studentRepository.findAll();
    }

    @Transactional
    public Student approveStudent(Long id, String admissionNumber) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));
        long olCount = olResultRepository.countByStudentId(id);
        if (olCount < 9) {
            throw new RuntimeException(
                "Cannot approve: student has only " + olCount + "/9 O/L results recorded. " +
                "All 9 subjects are required before approval.");
        }
        student.setRegistrationStatus("ACTIVE");
        student.setAdmissionNumber(admissionNumber);
        student.setRejectionReason(null);
        return studentRepository.save(student);
    }

    @Transactional
    public Student rejectStudent(Long id, String reason) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));
        student.setRegistrationStatus("REJECTED");
        student.setRejectionReason(reason);
        return studentRepository.save(student);
    }

    public ImportResultDTO importStudents(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename();
        if (filename == null) throw new Exception("Invalid file");

        if (filename.endsWith(".csv")) {
            return importCsv(file);
        } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            return importExcel(file);
        } else {
            throw new Exception("Unsupported format. Upload a CSV or Excel file.");
        }
    }

    private ImportResultDTO importCsv(MultipartFile file) throws Exception {
        int successCount = 0;
        int errorCount = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
             CSVReader csvReader = new CSVReader(reader)) {

            String[] header = csvReader.readNext();
            if (header == null) throw new Exception("CSV file is empty");

            Map<String, Integer> colIndex = new HashMap<>();
            for (int i = 0; i < header.length; i++) {
                colIndex.put(header[i].trim().toLowerCase().replace(" ", ""), i);
            }

            String[] line;
            int rowNum = 1;
            while ((line = csvReader.readNext()) != null) {
                rowNum++;
                try {
                    Student student = mapCsvRow(line, colIndex);
                    studentRepository.save(student);
                    successCount++;
                } catch (Exception e) {
                    errorCount++;
                    errors.add("Row " + rowNum + ": " + e.getMessage());
                }
            }
        }
        return new ImportResultDTO(successCount, errorCount, errors);
    }

    private Student mapCsvRow(String[] line, Map<String, Integer> colIndex) {
        Student s = new Student();
        s.setStudentType("INTERNAL");
        s.setRegistrationStatus("ACTIVE");
        s.setAdmissionNumber(required(cell(line, colIndex, "admissionnumber"), "admissionNumber"));
        s.setFullName(required(cell(line, colIndex, "fullname"), "fullName"));
        s.setEmail(cell(line, colIndex, "email"));
        s.setNicNumber(cell(line, colIndex, "nicnumber"));
        s.setGrade(cell(line, colIndex, "grade"));
        String alStream = upperOrNull(cell(line, colIndex, "alstream"));
        if (alStream == null) alStream = upperOrNull(cell(line, colIndex, "stream"));
        s.setAlStream(alStream);
        s.setStream(alStream);
        s.setGender(upperOrNull(cell(line, colIndex, "gender")));
        s.setMedium(upperOrNull(cell(line, colIndex, "medium")));
        s.setContactNumber(cell(line, colIndex, "contactnumber"));
        s.setWhatsappNumber(cell(line, colIndex, "whatsappnumber"));
        s.setAddress(cell(line, colIndex, "address"));
        s.setParentName(cell(line, colIndex, "parentname"));
        s.setParentContactNumber(cell(line, colIndex, "parentcontactnumber"));
        String dob = cell(line, colIndex, "dateofbirth");
        if (dob != null && !dob.isBlank()) {
            try { s.setDateOfBirth(LocalDate.parse(dob.trim(), DATE_FMT)); }
            catch (DateTimeParseException ignored) {}
        }
        return s;
    }

    private ImportResultDTO importExcel(MultipartFile file) throws Exception {
        int successCount = 0;
        int errorCount = 0;
        List<String> errors = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) throw new Exception("Excel file is empty");

            Map<String, Integer> colIndex = new HashMap<>();
            for (Cell cell : headerRow) {
                colIndex.put(cell.getStringCellValue().trim().toLowerCase().replace(" ", ""),
                        cell.getColumnIndex());
            }

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;
                try {
                    Student student = mapExcelRow(row, colIndex);
                    studentRepository.save(student);
                    successCount++;
                } catch (Exception e) {
                    errorCount++;
                    errors.add("Row " + (r + 1) + ": " + e.getMessage());
                }
            }
        }
        return new ImportResultDTO(successCount, errorCount, errors);
    }

    private Student mapExcelRow(Row row, Map<String, Integer> colIndex) {
        Student s = new Student();
        s.setStudentType("INTERNAL");
        s.setRegistrationStatus("ACTIVE");
        s.setAdmissionNumber(required(excelCell(row, colIndex, "admissionnumber"), "admissionNumber"));
        s.setFullName(required(excelCell(row, colIndex, "fullname"), "fullName"));
        s.setEmail(excelCell(row, colIndex, "email"));
        s.setNicNumber(excelCell(row, colIndex, "nicnumber"));
        s.setGrade(excelCell(row, colIndex, "grade"));
        String alStream = upperOrNull(excelCell(row, colIndex, "alstream"));
        if (alStream == null) alStream = upperOrNull(excelCell(row, colIndex, "stream"));
        s.setAlStream(alStream);
        s.setStream(alStream);
        s.setGender(upperOrNull(excelCell(row, colIndex, "gender")));
        s.setMedium(upperOrNull(excelCell(row, colIndex, "medium")));
        s.setContactNumber(excelCell(row, colIndex, "contactnumber"));
        s.setWhatsappNumber(excelCell(row, colIndex, "whatsappnumber"));
        s.setAddress(excelCell(row, colIndex, "address"));
        s.setParentName(excelCell(row, colIndex, "parentname"));
        s.setParentContactNumber(excelCell(row, colIndex, "parentcontactnumber"));
        String dob = excelCell(row, colIndex, "dateofbirth");
        if (dob != null && !dob.isBlank()) {
            try { s.setDateOfBirth(LocalDate.parse(dob.trim(), DATE_FMT)); }
            catch (DateTimeParseException ignored) {}
        }
        return s;
    }

    public Map<String, Object> promoteStudents(List<Long> studentIds) {
        int promoted = 0;
        int alreadyGrade13 = 0;
        int notFound = 0;

        for (Long id : studentIds) {
            Optional<Student> opt = studentRepository.findById(id);
            if (opt.isEmpty()) { notFound++; continue; }
            Student student = opt.get();
            if ("13".equals(student.getGrade())) {
                alreadyGrade13++;
            } else {
                student.setGrade("13");
                studentRepository.save(student);
                promoted++;
            }
        }
        return Map.of("promoted", promoted, "alreadyGrade13", alreadyGrade13, "notFound", notFound);
    }

    public java.io.ByteArrayInputStream exportStudents(List<Student> students) {
        try (java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
             java.io.PrintWriter writer = new java.io.PrintWriter(out)) {

            writer.println("admissionNumber,nicNumber,fullName,email,dateOfBirth,gender,grade,alStream," +
                           "medium,contactNumber,whatsappNumber,parentName,parentContactNumber,address,studentType");
            for (Student s : students) {
                writer.printf("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                        csv(s.getAdmissionNumber()),
                        csv(s.getNicNumber()),
                        csv(s.getFullName()),
                        csv(s.getEmail()),
                        csv(s.getDateOfBirth() != null ? s.getDateOfBirth().toString() : ""),
                        csv(s.getGender()),
                        csv(s.getGrade()),
                        csv(s.getAlStream()),
                        csv(s.getMedium()),
                        csv(s.getContactNumber()),
                        csv(s.getWhatsappNumber()),
                        csv(s.getParentName()),
                        csv(s.getParentContactNumber()),
                        csv(s.getAddress()),
                        csv(s.getStudentType()));
            }
            writer.flush();
            return new java.io.ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to export data: " + e.getMessage());
        }
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private String cell(String[] line, Map<String, Integer> colIndex, String key) {
        Integer idx = colIndex.get(key);
        if (idx == null || idx >= line.length) return null;
        String v = line[idx].trim();
        return v.isEmpty() ? null : v;
    }

    private String excelCell(Row row, Map<String, Integer> colIndex, String key) {
        Integer idx = colIndex.get(key);
        if (idx == null) return null;
        Cell cell = row.getCell(idx);
        if (cell == null) return null;
        String v = switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
        return v.isEmpty() ? null : v;
    }

    private String required(String value, String field) {
        if (value == null || value.isBlank())
            throw new IllegalArgumentException(field + " is required");
        return value;
    }

    private String upperOrNull(String value) {
        return value != null ? value.toUpperCase() : null;
    }

    private String csv(String data) {
        if (data == null) return "";
        String escaped = data.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n") || escaped.contains("\""))
            return "\"" + escaped + "\"";
        return escaped;
    }
}
