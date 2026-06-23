package com.sims.server.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nullable: external students use NIC as ID until approved
    @Column(unique = true)
    private String admissionNumber;

    @Column(nullable = false)
    private String fullName;

    private LocalDate dateOfBirth;

    private String gender;          // MALE | FEMALE | OTHER

    @Column(length = 500)
    private String address;

    private String contactNumber;

    private String whatsappNumber;

    private String email;

    @Column(length = 12)
    private String nicNumber;       // 12-digit Sri Lankan NIC

    private String grade;           // "12" | "13"

    // PHYSICAL_SCIENCE | BIOLOGICAL_SCIENCE | COMMERCE | TECHNOLOGY | ARTS
    private String alStream;

    private String medium;          // SINHALA | TAMIL | ENGLISH

    private String parentName;

    private String parentContactNumber;

    private String alApplicationStatus; // NOT_APPLIED | APPLIED | PENDING

    // INTERNAL | EXTERNAL
    @Column(nullable = false)
    private String studentType = "INTERNAL";

    // ACTIVE | PENDING_APPROVAL | REJECTED
    @Column(nullable = false)
    private String registrationStatus = "ACTIVE";

    @Column(length = 500)
    private String rejectionReason;

    @ElementCollection
    @CollectionTable(name = "student_al_subjects", joinColumns = @JoinColumn(name = "student_id"))
    @Column(name = "subject")
    private List<String> alSubjects = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OLResult> olResults = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Interview> interviews = new ArrayList<>();

    // Kept for backward-compatibility during migration — populated by StreamMigrationService
    private String stream;

    public Student() {}

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAdmissionNumber() { return admissionNumber; }
    public void setAdmissionNumber(String admissionNumber) { this.admissionNumber = admissionNumber; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNicNumber() { return nicNumber; }
    public void setNicNumber(String nicNumber) { this.nicNumber = nicNumber; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getAlStream() { return alStream; }
    public void setAlStream(String alStream) { this.alStream = alStream; }

    public String getStream() { return stream; }
    public void setStream(String stream) { this.stream = stream; }

    public String getMedium() { return medium; }
    public void setMedium(String medium) { this.medium = medium; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public String getParentContactNumber() { return parentContactNumber; }
    public void setParentContactNumber(String parentContactNumber) { this.parentContactNumber = parentContactNumber; }

    public String getAlApplicationStatus() { return alApplicationStatus; }
    public void setAlApplicationStatus(String alApplicationStatus) { this.alApplicationStatus = alApplicationStatus; }

    public String getStudentType() { return studentType; }
    public void setStudentType(String studentType) { this.studentType = studentType; }

    public String getRegistrationStatus() { return registrationStatus; }
    public void setRegistrationStatus(String registrationStatus) { this.registrationStatus = registrationStatus; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public List<String> getAlSubjects() { return alSubjects; }
    public void setAlSubjects(List<String> alSubjects) { this.alSubjects = alSubjects; }
}
