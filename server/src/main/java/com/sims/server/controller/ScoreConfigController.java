package com.sims.server.controller;

import com.sims.server.model.OLResult;
import com.sims.server.model.Student;
import com.sims.server.model.StreamScoreConfig;
import com.sims.server.dto.RankedApplicantDTO;
import com.sims.server.repository.OLResultRepository;
import com.sims.server.repository.StreamScoreConfigRepository;
import com.sims.server.repository.StudentRepository;
import com.sims.server.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@PreAuthorize("hasRole('ADMIN')")
public class ScoreConfigController {

    @Autowired private StreamScoreConfigRepository scoreConfigRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private OLResultRepository olResultRepository;
    @Autowired private ScoreService scoreService;

    @GetMapping("/score-config/{stream}")
    public List<StreamScoreConfig> getConfig(@PathVariable String stream) {
        return scoreConfigRepository.findByStream(stream.toUpperCase());
    }

    @PutMapping("/score-config/{stream}")
    public List<StreamScoreConfig> updateConfig(@PathVariable String stream,
                                                 @RequestBody List<Map<String, Object>> configs) {
        String streamUpper = stream.toUpperCase();
        scoreConfigRepository.deleteAll(scoreConfigRepository.findByStream(streamUpper));

        List<StreamScoreConfig> saved = new ArrayList<>();
        for (Map<String, Object> c : configs) {
            StreamScoreConfig cfg = new StreamScoreConfig();
            cfg.setStream(streamUpper);
            cfg.setSubjectCode(((String) c.get("subjectCode")).toUpperCase());
            cfg.setWeight(((Number) c.get("weight")).doubleValue());
            saved.add(scoreConfigRepository.save(cfg));
        }
        return saved;
    }

    @GetMapping("/applications/ranked")
    public List<RankedApplicantDTO> getRanked(@RequestParam String stream) {
        String streamUpper = stream.toUpperCase();
        List<Student> applicants = studentRepository.findAll().stream()
                .filter(s -> "EXTERNAL".equals(s.getStudentType()))
                .filter(s -> streamUpper.equals(s.getAlStream()))
                .collect(Collectors.toList());

        List<RankedApplicantDTO> ranked = new ArrayList<>();
        for (Student s : applicants) {
            RankedApplicantDTO dto = new RankedApplicantDTO();
            dto.setStudentId(s.getId());
            dto.setFullName(s.getFullName());
            dto.setNicNumber(s.getNicNumber());
            dto.setEmail(s.getEmail());
            dto.setAlStream(s.getAlStream());
            dto.setRegistrationStatus(s.getRegistrationStatus());

            List<OLResult> results = olResultRepository.findByStudentId(s.getId());
            Map<String, String> grades = new LinkedHashMap<>();
            for (OLResult r : results) {
                grades.put(r.getSubject().toUpperCase(), r.getGrade().toUpperCase());
            }
            dto.setSubjectGrades(grades);
            dto.setTotalScore(scoreService.computeScore(s.getId(), streamUpper));
            ranked.add(dto);
        }

        ranked.sort((a, b) -> Double.compare(b.getTotalScore(), a.getTotalScore()));
        for (int i = 0; i < ranked.size(); i++) {
            ranked.get(i).setRank(i + 1);
        }
        return ranked;
    }
}
