package com.sims.server.controller;

import com.sims.server.model.Student;
import com.sims.server.repository.StudentRepository;
import com.sims.server.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicStudentController {

    @Autowired private StudentRepository studentRepository;
    @Autowired private AuditService auditService;

    /** Self-registration from the /apply page */
    @PostMapping("/students")
    public ResponseEntity<?> registerStudent(@RequestBody Student student) {
        student.setStudentType("EXTERNAL");
        student.setRegistrationStatus("PENDING_APPROVAL");
        // Grade defaults to 12 for all applicants
        if (student.getGrade() == null) student.setGrade("12");
        Student saved = studentRepository.save(student);
        auditService.log("PUBLIC_REGISTRATION",
                "New external application: " + saved.getNicNumber() + " — " + saved.getFullName());
        return ResponseEntity.ok(Map.of("id", saved.getId(), "nicNumber", saved.getNicNumber()));
    }

    /** Google Forms Apps Script webhook */
    @PostMapping("/webhook/google-forms")
    public ResponseEntity<?> googleFormsWebhook(@RequestBody Map<String, String> fields) {
        Student student = mapWebhookFields(fields);
        Student saved = studentRepository.save(student);
        auditService.log("WEBHOOK_GOOGLE_FORMS",
                "Google Forms submission: " + saved.getNicNumber() + " — " + saved.getFullName());
        return ResponseEntity.ok(Map.of("id", saved.getId()));
    }

    /** MS Power Automate / MS Forms webhook */
    @PostMapping("/webhook/ms-forms")
    public ResponseEntity<?> msFormsWebhook(@RequestBody Map<String, String> fields) {
        Student student = mapWebhookFields(fields);
        Student saved = studentRepository.save(student);
        auditService.log("WEBHOOK_MS_FORMS",
                "MS Forms submission: " + saved.getNicNumber() + " — " + saved.getFullName());
        return ResponseEntity.ok(Map.of("id", saved.getId()));
    }

    private Student mapWebhookFields(Map<String, String> f) {
        Student s = new Student();
        s.setStudentType("EXTERNAL");
        s.setRegistrationStatus("PENDING_APPROVAL");
        s.setGrade("12");
        s.setFullName(f.getOrDefault("fullName", f.getOrDefault("full_name", "")));
        s.setEmail(f.getOrDefault("email", ""));
        s.setNicNumber(f.getOrDefault("nicNumber", f.getOrDefault("nic_number", "")));
        s.setGender(upper(f.getOrDefault("gender", "")));
        s.setMedium(upper(f.getOrDefault("medium", "")));
        s.setContactNumber(f.getOrDefault("contactNumber", f.getOrDefault("contact_number", "")));
        s.setWhatsappNumber(f.getOrDefault("whatsappNumber", f.getOrDefault("whatsapp_number", "")));
        s.setAddress(f.getOrDefault("address", ""));
        s.setParentName(f.getOrDefault("parentName", f.getOrDefault("parent_name", "")));
        s.setParentContactNumber(f.getOrDefault("parentContactNumber", f.getOrDefault("parent_contact", "")));
        String alStream = upper(f.getOrDefault("alStream", f.getOrDefault("stream", "")));
        s.setAlStream(alStream);
        s.setStream(alStream);
        String dob = f.getOrDefault("dateOfBirth", f.getOrDefault("date_of_birth", ""));
        if (!dob.isBlank()) {
            try { s.setDateOfBirth(LocalDate.parse(dob)); } catch (DateTimeParseException ignored) {}
        }
        return s;
    }

    private String upper(String v) {
        return (v == null || v.isBlank()) ? null : v.toUpperCase().trim();
    }
}
