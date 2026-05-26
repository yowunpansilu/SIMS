package com.sims.server.controller;

import com.sims.server.dto.ImportResultDTO;
import com.sims.server.model.Student;
import com.sims.server.repository.StudentRepository;
import com.sims.server.service.AuditService;
import com.sims.server.service.PdfReportService;
import com.sims.server.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired private StudentService studentService;
    @Autowired private StudentRepository studentRepository;
    @Autowired private PdfReportService pdfReportService;
    @Autowired private AuditService auditService;

    @GetMapping
    public List<Student> getAllStudents(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) String alStream,
            @RequestParam(required = false) String registrationStatus,
            @RequestParam(required = false) String studentType) {
        return studentService.getAllStudents(q, grade, alStream, registrationStatus, studentType);
    }

    @GetMapping("/pending")
    public List<Student> getPendingApplications() {
        return studentService.getAllStudents(null, null, null, "PENDING_APPROVAL", "EXTERNAL");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        if (student.getStudentType() == null) student.setStudentType("INTERNAL");
        // Always derive registrationStatus from studentType — the Java field default ("ACTIVE")
        // cannot be trusted since Jackson sets it before we see the request body.
        student.setRegistrationStatus(
            "INTERNAL".equals(student.getStudentType()) ? "ACTIVE" : "PENDING_APPROVAL");
        Student saved = studentRepository.save(student);
        String id = saved.getAdmissionNumber() != null ? saved.getAdmissionNumber() : saved.getNicNumber();
        auditService.log("CREATE_STUDENT", "Created " + saved.getStudentType().toLowerCase()
                + " student: " + id + " — " + saved.getFullName());
        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        return studentRepository.findById(id)
                .map(student -> {
                    student.setAdmissionNumber(studentDetails.getAdmissionNumber());
                    student.setFullName(studentDetails.getFullName());
                    student.setDateOfBirth(studentDetails.getDateOfBirth());
                    student.setGender(studentDetails.getGender());
                    student.setAddress(studentDetails.getAddress());
                    student.setContactNumber(studentDetails.getContactNumber());
                    student.setWhatsappNumber(studentDetails.getWhatsappNumber());
                    student.setEmail(studentDetails.getEmail());
                    student.setNicNumber(studentDetails.getNicNumber());
                    student.setGrade(studentDetails.getGrade());
                    student.setAlStream(studentDetails.getAlStream());
                    student.setAlSubjects(studentDetails.getAlSubjects());
                    student.setStream(studentDetails.getAlStream()); // keep legacy column in sync
                    student.setMedium(studentDetails.getMedium());
                    student.setParentName(studentDetails.getParentName());
                    student.setParentContactNumber(studentDetails.getParentContactNumber());
                    student.setAlApplicationStatus(studentDetails.getAlApplicationStatus());
                    Student saved = studentRepository.save(student);
                    auditService.log("UPDATE_STUDENT", "Updated student: "
                            + saved.getAdmissionNumber() + " — " + saved.getFullName());
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        studentRepository.findById(id).ifPresent(s ->
                auditService.log("DELETE_STUDENT", "Deleted student: "
                        + s.getAdmissionNumber() + " — " + s.getFullName()));
        studentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveStudent(@PathVariable Long id,
                                             @RequestBody Map<String, String> body) {
        String admissionNumber = body.get("admissionNumber");
        if (admissionNumber == null || admissionNumber.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "admissionNumber is required"));
        }
        try {
            Student approved = studentService.approveStudent(id, admissionNumber);
            auditService.log("APPROVE_EXTERNAL_STUDENT",
                    "Approved: " + approved.getFullName() + " | Admission: " + admissionNumber);
            return ResponseEntity.ok(approved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectStudent(@PathVariable Long id,
                                            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        if (reason == null || reason.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "reason is required"));
        }
        try {
            Student rejected = studentService.rejectStudent(id, reason);
            auditService.log("REJECT_EXTERNAL_STUDENT",
                    "Rejected: " + rejected.getFullName() + " | Reason: " + reason);
            return ResponseEntity.ok(rejected);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/requeue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> requeueStudent(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(student -> {
                    student.setRegistrationStatus("PENDING_APPROVAL");
                    student.setRejectionReason(null);
                    Student saved = studentRepository.save(student);
                    auditService.log("REQUEUE_EXTERNAL_STUDENT",
                            "Re-queued: " + saved.getFullName());
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/import")
    public ResponseEntity<ImportResultDTO> importStudents(@RequestParam("file") MultipartFile file) {
        try {
            ImportResultDTO result = studentService.importStudents(file);
            auditService.log("IMPORT_STUDENTS", "Imported " + result.getSuccessCount()
                    + " students (" + result.getErrorCount() + " errors)");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ImportResultDTO(0, 1, List.of(e.getMessage())));
        }
    }

    @PostMapping("/promote")
    public ResponseEntity<?> promoteStudents(@RequestBody List<Long> studentIds) {
        Object result = studentService.promoteStudents(studentIds);
        auditService.log("PROMOTE_STUDENTS", "Promoted " + studentIds.size() + " students to Grade 13");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportStudents() {
        List<Student> students = studentRepository.findAll();
        java.io.ByteArrayInputStream in = studentService.exportStudents(students);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=students.csv");
        return ResponseEntity.ok().headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportStudentsPdf(
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) String alStream) {
        List<Student> students = studentService.getAllStudents(null, grade, alStream, "ACTIVE", null);
        String title = buildPdfTitle(grade, alStream);
        byte[] pdf = pdfReportService.generateStudentListPdf(students, title);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=students-report.pdf");
        return ResponseEntity.ok().headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    private String buildPdfTitle(String grade, String alStream) {
        if (grade != null && alStream != null) return "Grade " + grade + " — " + alStream;
        if (grade != null) return "Grade " + grade + " Students";
        if (alStream != null) return alStream + " Students";
        return "All Students";
    }
}
