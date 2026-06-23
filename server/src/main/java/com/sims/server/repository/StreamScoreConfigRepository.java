package com.sims.server.repository;

import com.sims.server.model.StreamScoreConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StreamScoreConfigRepository extends JpaRepository<StreamScoreConfig, Long> {
    List<StreamScoreConfig> findByStream(String stream);
    Optional<StreamScoreConfig> findByStreamAndSubjectCode(String stream, String subjectCode);
}
