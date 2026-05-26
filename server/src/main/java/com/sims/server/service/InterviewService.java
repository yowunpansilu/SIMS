package com.sims.server.service;

import com.sims.server.model.Interview;
import com.sims.server.model.Student;
import com.sims.server.repository.InterviewRepository;
import com.sims.server.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class InterviewService {

    @Autowired private InterviewRepository interviewRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private EmailService emailService;
    @Autowired private AuditService auditService;

    @Transactional
    public List<Interview> scheduleBatch(List<Long> studentIds, LocalDateTime startAt,
                                         int durationMinutes, String location) {
        List<Interview> created = new ArrayList<>();
        LocalDateTime slot = startAt;

        for (Long studentId : studentIds) {
            Student student = studentRepository.findById(studentId).orElse(null);
            if (student == null) continue;

            Interview interview = new Interview();
            interview.setStudent(student);
            interview.setScheduledAt(slot);
            interview.setDurationMinutes(durationMinutes);
            interview.setLocation(location);
            interview.setStatus("SCHEDULED");
            created.add(interviewRepository.save(interview));

            student.setRegistrationStatus("SCHEDULED");
            studentRepository.save(student);

            emailService.sendInterviewConfirmation(student, slot, location);
            auditService.log("INTERVIEW_SCHEDULED",
                    "Interview at " + slot + " for " + student.getNicNumber() + " — " + student.getFullName());

            slot = slot.plusMinutes(durationMinutes);
        }
        return created;
    }

    @Transactional
    public Interview updateStatus(Long id, String status) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found: " + id));
        interview.setStatus(status);
        return interviewRepository.save(interview);
    }
}
