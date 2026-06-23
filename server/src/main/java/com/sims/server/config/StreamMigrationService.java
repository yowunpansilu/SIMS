package com.sims.server.config;

import com.sims.server.model.Student;
import com.sims.server.repository.StudentRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class StreamMigrationService {

    private static final Map<String, String> STREAM_MAP = Map.of(
            "SCIENCE",    "PHYSICAL_SCIENCE",
            "COMMERCE",   "COMMERCE",
            "ARTS",       "ARTS",
            "TECHNOLOGY", "TECHNOLOGY",
            "OTHER",      "ARTS"
    );

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void migrateStreams() {
        // Remove NOT NULL from admission_number so external students can have null
        try {
            jdbcTemplate.execute(
                "ALTER TABLE students MODIFY COLUMN admission_number VARCHAR(255) NULL");
        } catch (Exception ignored) {}

        // Backfill registration_status — covers NULL and '' (MySQL adds '' for NOT NULL columns)
        jdbcTemplate.update(
            "UPDATE students SET registration_status = 'ACTIVE' " +
            "WHERE registration_status IS NULL OR registration_status = ''");

        // Backfill student_type
        jdbcTemplate.update(
            "UPDATE students SET student_type = 'INTERNAL' " +
            "WHERE student_type IS NULL OR student_type = ''");

        // Migrate legacy stream → al_stream for any rows that still need it
        jdbcTemplate.update(
            "UPDATE students SET al_stream = CASE stream " +
            "  WHEN 'SCIENCE'     THEN 'PHYSICAL_SCIENCE' " +
            "  WHEN 'COMMERCE'    THEN 'COMMERCE' " +
            "  WHEN 'ARTS'        THEN 'ARTS' " +
            "  WHEN 'TECHNOLOGY'  THEN 'TECHNOLOGY' " +
            "  ELSE 'ARTS' END " +
            "WHERE (al_stream IS NULL OR al_stream = '') AND stream IS NOT NULL AND stream != ''");

        // JPA-level pass: also sync any object-level changes that SQL above may have missed
        for (Student s : studentRepository.findAll()) {
            boolean dirty = false;
            if (s.getAlStream() == null && s.getStream() != null) {
                s.setAlStream(STREAM_MAP.getOrDefault(s.getStream(), "ARTS"));
                dirty = true;
            }
            if (s.getRegistrationStatus() == null || s.getRegistrationStatus().isBlank()) {
                s.setRegistrationStatus("ACTIVE");
                dirty = true;
            }
            if (s.getStudentType() == null || s.getStudentType().isBlank()) {
                s.setStudentType("INTERNAL");
                dirty = true;
            }
            if (dirty) studentRepository.save(s);
        }
    }
}
