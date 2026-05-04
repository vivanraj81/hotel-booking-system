package com.hotel.auth.config;

import com.hotel.auth.entity.Role;
import com.hotel.auth.entity.User;
import com.hotel.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(new User("admin", passwordEncoder.encode("admin123"), Role.ADMIN));
            System.out.println(">> Seeded user: admin/admin123 (ADMIN)");
        }
        if (!userRepository.existsByUsername("user")) {
            userRepository.save(new User("user", passwordEncoder.encode("user123"), Role.USER));
            System.out.println(">> Seeded user: user/user123 (USER)");
        }
    }
}
