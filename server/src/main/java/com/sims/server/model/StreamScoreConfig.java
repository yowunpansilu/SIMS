package com.sims.server.model;

import jakarta.persistence.*;

@Entity
@Table(name = "stream_score_configs",
        uniqueConstraints = @UniqueConstraint(columnNames = {"stream", "subject_code"}))
public class StreamScoreConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String stream;

    @Column(name = "subject_code", nullable = false)
    private String subjectCode;

    private double weight = 1.0;

    public StreamScoreConfig() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStream() { return stream; }
    public void setStream(String stream) { this.stream = stream; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }
}
