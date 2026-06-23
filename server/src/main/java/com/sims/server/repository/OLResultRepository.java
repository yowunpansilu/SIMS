package com.sims.server.repository;

import com.sims.server.model.OLResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OLResultRepository extends JpaRepository<OLResult, Long> {
    List<OLResult> findByStudentId(Long studentId);
    long countByStudentId(Long studentId);
    void deleteByStudentId(Long studentId);

    @Query("SELECT r.subject, r.grade, COUNT(r) FROM OLResult r GROUP BY r.subject, r.grade ORDER BY r.subject, r.grade")
    List<Object[]> countBySubjectAndGrade();
}
