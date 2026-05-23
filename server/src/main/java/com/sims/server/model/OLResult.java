package com.sims.server.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ol_results",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "subject", "exam_year"}))
public class OLResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String subject; // e.g. MATHEMATICS, PHYSICS, CHEMISTRY

    @Column(nullable = false)
    private String grade;   // A | B | C | S | W

    @Column(name = "exam_year")
    private Integer examYear;

    public OLResult() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public Integer getExamYear() { return examYear; }
    public void setExamYear(Integer examYear) { this.examYear = examYear; }
}
