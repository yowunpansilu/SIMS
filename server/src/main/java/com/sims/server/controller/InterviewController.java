package com.sims.server.controller;

import com.sims.server.dto.InterviewDTO;
import com.sims.server.model.Interview;
import com.sims.server.repository.InterviewRepository;
import com.sims.server.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interviews")
@PreAuthorize("hasRole('ADMIN')")
public class InterviewController {

    @Autowired private InterviewRepository interviewRepository;
    @Autowired private InterviewService interviewService;

    @GetMapping
    public List<InterviewDTO> getInterviews(@RequestParam(required = false) String date,
                                             @RequestParam(required = false) String status) {
        List<Interview> interviews;
        if (date != null) {
            LocalDate d = LocalDate.parse(date);
            interviews = interviewRepository.findByScheduledAtBetween(
                    d.atStartOfDay(), d.atTime(LocalTime.MAX));
        } else if (status != null) {
            interviews = interviewRepository.findByStatus(status);
        } else {
            interviews = interviewRepository.findAll();
        }
        return interviews.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @PostMapping("/schedule-batch")
    public ResponseEntity<?> scheduleBatch(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Number> ids = (List<Number>) body.get("studentIds");
        List<Long> studentIds = ids.stream().map(Number::longValue).collect(Collectors.toList());
        String startAt = (String) body.get("startAt");
        int durationMinutes = ((Number) body.getOrDefault("durationMinutes", 10)).intValue();
        String location = (String) body.getOrDefault("location", "");

        LocalDateTime start = LocalDateTime.parse(startAt);
        List<Interview> created = interviewService.scheduleBatch(studentIds, start, durationMinutes, location);
        return ResponseEntity.ok(created.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InterviewDTO> updateStatus(@PathVariable Long id,
                                                      @RequestBody Map<String, String> body) {
        Interview updated = interviewService.updateStatus(id, body.get("status"));
        return ResponseEntity.ok(toDTO(updated));
    }

    private InterviewDTO toDTO(Interview i) {
        InterviewDTO dto = new InterviewDTO();
        dto.setId(i.getId());
        dto.setScheduledAt(i.getScheduledAt());
        dto.setDurationMinutes(i.getDurationMinutes());
        dto.setLocation(i.getLocation());
        dto.setStatus(i.getStatus());
        dto.setNotes(i.getNotes());
        if (i.getStudent() != null) {
            dto.setStudentId(i.getStudent().getId());
            dto.setStudentName(i.getStudent().getFullName());
            dto.setStudentNic(i.getStudent().getNicNumber());
            dto.setStudentEmail(i.getStudent().getEmail());
            dto.setStudentAlStream(i.getStudent().getAlStream());
            dto.setStudentContactNumber(i.getStudent().getContactNumber());
            dto.setStudentParentContactNumber(i.getStudent().getParentContactNumber());
        }
        return dto;
    }
}
