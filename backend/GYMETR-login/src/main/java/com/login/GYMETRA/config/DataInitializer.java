package com.login.GYMETRA.config;

import com.login.GYMETRA.entity.Role;
import com.login.GYMETRA.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds the database with the base roles ({@code Admin}, {@code Client}) on
 * startup if they do not already exist.
 *
 * <p>No users are pre-seeded because user creation is now driven by
 * {@link com.login.GYMETRA.service.CognitoUserSyncService} on first login.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedRole("Admin",  "Administrador del sistema");
        seedRole("Client", "Cliente del gimnasio");
    }

    private void seedRole(String name, String description) {
        if (roleRepository.findByRoleName(name).isEmpty()) {
            roleRepository.save(Role.builder()
                    .roleName(name)
                    .description(description)
                    .build());
            log.info("Role '{}' created by DataInitializer", name);
        }
    }
}