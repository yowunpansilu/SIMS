package com.sims.server.controller;

import com.sims.server.model.Student;
import com.sims.server.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        System.out.println("Received Create Request: " + student);
        try {
            Student saved = studentRepository.save(student);
            System.out.println("Saved Student ID: " + saved.getId());
            return saved;
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        return studentRepository.findById(id)
                .map(student -> {
                    student.setAdmissionNumber(studentDetails.getAdmissionNumber());
                    student.setFullName(studentDetails.getFullName());
                    student.setDateOfBirth(studentDetails.getDateOfBirth());
                    student.setGender(studentDetails.getGender());
                    student.setAddress(studentDetails.getAddress());
                    student.setContactNumber(studentDetails.getContactNumber());
                    student.setGrade(studentDetails.getGrade());
                    student.setStream(studentDetails.getStream());
                    return ResponseEntity.ok(studentRepository.save(student));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(student -> {
                    studentRepository.delete(student);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
