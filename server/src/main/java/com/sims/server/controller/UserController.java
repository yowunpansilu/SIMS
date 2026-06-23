package com.sims.server.controller;

import com.sims.server.dto.UserDTO;
import com.sims.server.model.User;
import com.sims.server.repository.UserRepository;
import com.sims.server.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::from)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);
        auditService.log("CREATE_USER", "Created user: " + saved.getUsername() + " [" + saved.getRole() + "]");
        return ResponseEntity.ok(UserDTO.from(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setUsername(userDetails.getUsername());
                    user.setFullName(userDetails.getFullName());
                    user.setRole(userDetails.getRole());
                    user.setEmail(userDetails.getEmail());
                    if (userDetails.getPassword() != null && !userDetails.getPassword().isBlank()) {
                        user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                    }
                    User saved = userRepository.save(user);
                    auditService.log("UPDATE_USER", "Updated user: " + saved.getUsername());
                    return ResponseEntity.ok(UserDTO.from(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.findById(id).ifPresent(u ->
                auditService.log("DELETE_USER", "Deleted user: " + u.getUsername()));
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
