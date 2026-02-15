package com.sims.server.controller;

import com.sims.server.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", studentRepository.count());
        stats.put("grade12Count", studentRepository.countByGrade("12"));
        stats.put("grade13Count", studentRepository.countByGrade("13"));
        stats.put("maleCount", studentRepository.countByGender("Male"));
        stats.put("femaleCount", studentRepository.countByGender("Female"));
        // Assuming Logic: New admissions this year is approximated by Grade 12 students
        // or similar
        // For now, returning 0 or total as a placeholder if logic is unclear
        stats.put("newAdmissionsThisYear", studentRepository.countByGrade("12"));
        return stats;
    }

    @GetMapping("/demographics")
    public Map<String, Object> getDemographics() {
        Map<String, Object> response = new HashMap<>();

        response.put("streamDistribution", formatDistribution(studentRepository.countByStreamGroup(), "stream"));
        response.put("genderDistribution", formatDistribution(studentRepository.countByGenderGroup(), "gender"));
        response.put("gradeDistribution", formatDistribution(studentRepository.countByGradeGroup(), "grade"));

        return response;
    }

    private List<Map<String, Object>> formatDistribution(List<Object[]> data, String keyName) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : data) {
            Map<String, Object> item = new HashMap<>();
            item.put(keyName, row[0]);
            item.put("count", row[1]);
            result.add(item);
        }
        return result;
    }
}
