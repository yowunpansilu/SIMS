package com.sims.server.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String action;

    @Column(nullable = false, length = 64)
    private String performedBy;

    @Column(length = 512)
    private String detail;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    void prePersist() {
        if (timestamp == null) timestamp = LocalDateTime.now();
    }

    public AuditLog() {}

    public AuditLog(String action, String performedBy, String detail) {
        this.action = action;
        this.performedBy = performedBy;
        this.detail = detail;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getAction() { return action; }
    public String getPerformedBy() { return performedBy; }
    public String getDetail() { return detail; }
    public LocalDateTime getTimestamp() { return timestamp; }

    public void setId(Long id) { this.id = id; }
    public void setAction(String action) { this.action = action; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    public void setDetail(String detail) { this.detail = detail; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
