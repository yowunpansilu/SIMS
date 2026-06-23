package com.sims.server.config;

import com.sims.server.model.User;
import com.sims.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${ADMIN_SETUP_USERNAME:}")
    private String adminUsername;

    @Value("${ADMIN_SETUP_PASSWORD:}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        // Only run if credentials are provided in the environment and DB is empty
        if (!adminUsername.isBlank() && !adminPassword.isBlank() && userRepository.count() == 0) {
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN");
            admin.setFullName("System Administrator");
            userRepository.save(admin);
            System.out.println("==================================================");
            System.out.println("DataInitializer: Admin user created securely via ENV variables");
            System.out.println("==================================================");
        }
    }
}
