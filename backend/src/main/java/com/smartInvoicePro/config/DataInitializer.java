package com.smartInvoicePro.config;

import com.smartInvoicePro.modules.role.entity.Role;
import com.smartInvoicePro.modules.role.repository.RoleRepository;
import com.smartInvoicePro.modules.user.entity.User;
import com.smartInvoicePro.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Seed Roles
            Role adminRole = seedRole("ROLE_ADMIN");
            Role userRole  = seedRole("ROLE_USER");

            // Seed Admin User
            if (!userRepository.existsByEmail("admin@smartinvoice.tn")) {
                User admin = User.builder()
                        .firstName("Super")
                        .lastName("Admin")
                        .email("admin@smartinvoice.tn")
                        .password(passwordEncoder.encode("Admin@1234"))
                        .active(true)
                        .roles(Set.of(adminRole, userRole))
                        .build();
                userRepository.save(admin);
                log.info("Admin user created: admin@smartinvoice.tn / Admin@1234");
            } else {
                log.info("ℹ️ Admin user already exists, skipping.");
            }
        };
    }

    private Role seedRole(String name) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role role = roleRepository.save(Role.builder().name(name).build());
            log.info(" Role created: {}", name);
            return role;
        });
    }
}
