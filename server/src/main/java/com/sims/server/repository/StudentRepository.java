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
    long countByRegistrationStatus(String registrationStatus);

    @Query("SELECT s.alStream, COUNT(s) FROM Student s WHERE s.registrationStatus = 'ACTIVE' GROUP BY s.alStream")
    List<Object[]> countByStreamGroup();

    @Query("SELECT s.gender, COUNT(s) FROM Student s WHERE s.registrationStatus = 'ACTIVE' GROUP BY s.gender")
    List<Object[]> countByGenderGroup();

    @Query("SELECT s.grade, COUNT(s) FROM Student s WHERE s.registrationStatus = 'ACTIVE' GROUP BY s.grade")
    List<Object[]> countByGradeGroup();

    List<Student> findTop5ByRegistrationStatusOrderByIdDesc(String registrationStatus);

    @Query("SELECT s FROM Student s WHERE " +
           "(:q IS NULL OR LOWER(s.fullName) LIKE LOWER(CONCAT('%',:q,'%')) " +
           "  OR LOWER(COALESCE(s.admissionNumber,'')) LIKE LOWER(CONCAT('%',:q,'%')) " +
           "  OR LOWER(COALESCE(s.nicNumber,'')) LIKE LOWER(CONCAT('%',:q,'%'))) " +
           "AND (:grade IS NULL OR s.grade = :grade) " +
           "AND (:alStream IS NULL OR s.alStream = :alStream) " +
           "AND (:registrationStatus IS NULL OR s.registrationStatus = :registrationStatus) " +
           "AND (:studentType IS NULL OR s.studentType = :studentType)")
    List<Student> searchStudents(@Param("q") String q,
                                 @Param("grade") String grade,
                                 @Param("alStream") String alStream,
                                 @Param("registrationStatus") String registrationStatus,
                                 @Param("studentType") String studentType);
}
