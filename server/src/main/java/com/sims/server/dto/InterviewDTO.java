package com.sims.server.dto;

import java.time.LocalDateTime;

public class InterviewDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentNic;
    private String studentEmail;
    private String studentAlStream;
    private String studentContactNumber;
    private String studentParentContactNumber;
    private LocalDateTime scheduledAt;
    private int durationMinutes;
    private String location;
    private String status;
    private String notes;

    public InterviewDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentNic() { return studentNic; }
    public void setStudentNic(String studentNic) { this.studentNic = studentNic; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getStudentAlStream() { return studentAlStream; }
    public void setStudentAlStream(String studentAlStream) { this.studentAlStream = studentAlStream; }

    public String getStudentContactNumber() { return studentContactNumber; }
    public void setStudentContactNumber(String studentContactNumber) { this.studentContactNumber = studentContactNumber; }

    public String getStudentParentContactNumber() { return studentParentContactNumber; }
    public void setStudentParentContactNumber(String studentParentContactNumber) { this.studentParentContactNumber = studentParentContactNumber; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
