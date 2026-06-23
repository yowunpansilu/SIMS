package com.sims.server.repository;

import com.sims.server.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByScheduledAtBetween(LocalDateTime start, LocalDateTime end);
    List<Interview> findByStudentId(Long studentId);
    List<Interview> findByStatus(String status);
}
