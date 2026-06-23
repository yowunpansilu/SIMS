package com.sims.server.dto;

import java.util.Map;

public class RankedApplicantDTO {
    private Long studentId;
    private String fullName;
    private String nicNumber;
    private String email;
    private String alStream;
    private double totalScore;
    private Map<String, String> subjectGrades;
    private String registrationStatus;
    private int rank;

    public RankedApplicantDTO() {}

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getNicNumber() { return nicNumber; }
    public void setNicNumber(String nicNumber) { this.nicNumber = nicNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAlStream() { return alStream; }
    public void setAlStream(String alStream) { this.alStream = alStream; }

    public double getTotalScore() { return totalScore; }
    public void setTotalScore(double totalScore) { this.totalScore = totalScore; }

    public Map<String, String> getSubjectGrades() { return subjectGrades; }
    public void setSubjectGrades(Map<String, String> subjectGrades) { this.subjectGrades = subjectGrades; }

    public String getRegistrationStatus() { return registrationStatus; }
    public void setRegistrationStatus(String registrationStatus) { this.registrationStatus = registrationStatus; }

    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }
}
