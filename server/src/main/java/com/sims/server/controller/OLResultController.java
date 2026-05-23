package com.sims.server.controller;

import com.sims.server.model.OLResult;
import com.sims.server.repository.OLResultRepository;
import com.sims.server.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students/{studentId}/ol-results")
public class OLResultController {

    @Autowired
    private OLResultRepository olResultRepository;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public ResponseEntity<List<OLResult>> getResults(@PathVariable Long studentId) {
        if (!studentRepository.existsById(studentId)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(olResultRepository.findByStudentId(studentId));
    }

    @PostMapping
    public ResponseEntity<?> addResult(@PathVariable Long studentId, @RequestBody OLResult result) {
        return studentRepository.findById(studentId).map(student -> {
            result.setStudent(student);
            return ResponseEntity.ok(olResultRepository.save(result));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{resultId}")
    public ResponseEntity<?> updateResult(@PathVariable Long studentId,
                                          @PathVariable Long resultId,
                                          @RequestBody OLResult details) {
        return olResultRepository.findById(resultId).map(result -> {
            if (!result.getStudent().getId().equals(studentId))
                return ResponseEntity.status(403).body(Map.of("error", "Result does not belong to this student"));
            result.setSubject(details.getSubject());
            result.setGrade(details.getGrade());
            result.setExamYear(details.getExamYear());
            return ResponseEntity.ok(olResultRepository.save(result));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{resultId}")
    public ResponseEntity<?> deleteResult(@PathVariable Long studentId, @PathVariable Long resultId) {
        return olResultRepository.findById(resultId).map(result -> {
            if (!result.getStudent().getId().equals(studentId))
                return ResponseEntity.status(403).body(Map.of("error", "Result does not belong to this student"));
            olResultRepository.delete(result);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
