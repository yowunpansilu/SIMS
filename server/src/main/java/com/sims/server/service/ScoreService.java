package com.sims.server.service;

import com.sims.server.model.OLResult;
import com.sims.server.model.StreamScoreConfig;
import com.sims.server.repository.OLResultRepository;
import com.sims.server.repository.StreamScoreConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ScoreService {

    private static final Map<String, Integer> GRADE_POINTS = Map.of(
            "A", 5, "B", 4, "C", 3, "S", 2, "W", 0
    );

    @Autowired private OLResultRepository olResultRepository;
    @Autowired private StreamScoreConfigRepository scoreConfigRepository;

    public double computeScore(Long studentId, String stream) {
        List<OLResult> results = olResultRepository.findByStudentId(studentId);
        List<StreamScoreConfig> configs = scoreConfigRepository.findByStream(stream);
        Map<String, Double> weights = configs.stream()
                .collect(Collectors.toMap(StreamScoreConfig::getSubjectCode, StreamScoreConfig::getWeight));

        double total = 0.0;
        for (OLResult r : results) {
            int points = GRADE_POINTS.getOrDefault(r.getGrade().toUpperCase(), 0);
            double weight = weights.getOrDefault(r.getSubject().toUpperCase(), 1.0);
            total += points * weight;
        }
        return total;
    }

    public Map<String, Integer> getGradePoints() {
        return GRADE_POINTS;
    }
}
