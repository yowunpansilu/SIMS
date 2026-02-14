package com.sims.server.repository;

import com.sims.server.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByAdmissionNumber(String admissionNumber);

    long countByGrade(String grade);

    long countByGender(String gender);

    @Query("SELECT s.stream, COUNT(s) FROM Student s GROUP BY s.stream")
    List<Object[]> countByStreamGroup();

    @Query("SELECT s.gender, COUNT(s) FROM Student s GROUP BY s.gender")
    List<Object[]> countByGenderGroup();

    @Query("SELECT s.grade, COUNT(s) FROM Student s GROUP BY s.grade")
    List<Object[]> countByGradeGroup();

    @Query("SELECT s FROM Student s WHERE " +
            "(:q IS NULL OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(s.admissionNumber) LIKE LOWER(CONCAT('%', :q, '%'))) "
            +
            "AND (:grade IS NULL OR s.grade = :grade) " +
            "AND (:stream IS NULL OR s.stream = :stream)")
    List<Student> searchStudents(@Param("q") String q,
            @Param("grade") String grade,
            @Param("stream") String stream);
}
