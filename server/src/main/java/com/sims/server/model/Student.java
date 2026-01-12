package com.sims.server.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String admissionNumber;

    @Column(nullable = false)
    private String fullName;

    private LocalDate dateOfBirth;
    private String gender; // Male/Female

    @Column(length = 500)
    private String address;

    private String contactNumber;

    private String grade; // 12 or 13
    private String stream; // Science, Arts, Commerce, Tech
}
