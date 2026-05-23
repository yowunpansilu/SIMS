package com.sims.server.controller;

import com.sims.server.model.Student;
import com.sims.server.repository.OLResultRepository;
import com.sims.server.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private OLResultRepository olResultRepository;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalStudents", studentRepository.countByRegistrationStatus("ACTIVE"));
        stats.put("grade12Count", studentRepository.countByGrade("12"));
        stats.put("grade13Count", studentRepository.countByGrade("13"));
        stats.put("maleCount", studentRepository.countByGender("MALE"));
        stats.put("femaleCount", studentRepository.countByGender("FEMALE"));
        stats.put("newAdmissionsThisYear", studentRepository.countByGrade("12"));
        stats.put("pendingApplications", studentRepository.countByRegistrationStatus("PENDING_APPROVAL"));

        // Stream counts as a flat map { "SCIENCE": 80, "COMMERCE": 60, ... }
        Map<String, Long> streamCounts = new LinkedHashMap<>();
        for (Object[] row : studentRepository.countByStreamGroup()) {
            if (row[0] != null) streamCounts.put(row[0].toString(), (Long) row[1]);
        }
        stats.put("streamCounts", streamCounts);

        // 5 most recently added students
        List<Map<String, Object>> recent = studentRepository.findTop5ByRegistrationStatusOrderByIdDesc("ACTIVE")
                .stream()
                .map(this::toRecentEntry)
                .collect(Collectors.toList());
        stats.put("recentStudents", recent);

        return stats;
    }

    @GetMapping("/demographics")
    public Map<String, Object> getDemographics() {
        Map<String, Object> response = new HashMap<>();
        response.put("streamDistribution", toDistribution(studentRepository.countByStreamGroup(), "stream"));
        response.put("genderDistribution", toDistribution(studentRepository.countByGenderGroup(), "gender"));
        response.put("gradeDistribution", toDistribution(studentRepository.countByGradeGroup(), "grade"));
        return response;
    }

    private List<Map<String, Object>> toDistribution(List<Object[]> data, String keyName) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : data) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put(keyName, row[0]);
            item.put("count", row[1]);
            result.add(item);
        }
        return result;
    }

    private Map<String, Object> toRecentEntry(Student s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId());
        m.put("admissionNumber", s.getAdmissionNumber());
        m.put("fullName", s.getFullName());
        m.put("grade", s.getGrade());
        m.put("stream", s.getStream());
        return m;
    }

    @GetMapping("/ol-summary")
    public List<Map<String, Object>> getOlSummary() {
        List<Object[]> rows = olResultRepository.countBySubjectAndGrade();
        // Build { subject -> { grade -> count } }
        Map<String, Map<String, Long>> bySubject = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String subject = (String) row[0];
            String grade   = (String) row[1];
            Long   count   = (Long)   row[2];
            bySubject.computeIfAbsent(subject, k -> new LinkedHashMap<>()).put(grade, count);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Map<String, Long>> entry : bySubject.entrySet()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("subject", entry.getKey());
            long pass = 0, fail = 0;
            for (Map.Entry<String, Long> g : entry.getValue().entrySet()) {
                item.put(g.getKey(), g.getValue());
                if ("W".equals(g.getKey())) fail += g.getValue(); else pass += g.getValue();
            }
            item.put("pass", pass);
            item.put("fail", fail);
            result.add(item);
        }
        return result;
    }
}
