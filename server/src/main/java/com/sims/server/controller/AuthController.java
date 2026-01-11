package com.sims.server.controller;

import com.sims.server.model.User;
import com.sims.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow Client to connect easily
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        // Simple Plaintext Password Check for Prototype (Replace with BCrypt later)
        return userRepository.findByUsername(username)
                .filter(user -> user.getPassword().equals(password))
                .map(user -> ResponseEntity.ok(Map.of("message", "Login successful", "role", user.getRole())))
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
    }

    @PostMapping("/setup")
    public ResponseEntity<?> setupAdmin() {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin123");
            admin.setRole("ADMIN");
            admin.setFullName("System Administrator");
            userRepository.save(admin);
            return ResponseEntity.ok("Admin user created (admin/admin123)");
        }
        return ResponseEntity.badRequest().body("Users already exist");
    }
}
