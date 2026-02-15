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
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping("/stream-summary")
    public List<Map<String, Object>> getStreamSummary() {
        return formatDistribution(studentRepository.countByStreamGroup(), "stream");
    }

    @GetMapping("/admission-stats")
    public Map<String, Object> getAdmissionStats() {
        // Placeholder for advanced admission stats (e.g., monthly/yearly trends)
        // Currently returning total count as a baseline
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAdmissions", studentRepository.count());
        // Future: Add year-over-year growth if admission date is available
        return stats;
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
