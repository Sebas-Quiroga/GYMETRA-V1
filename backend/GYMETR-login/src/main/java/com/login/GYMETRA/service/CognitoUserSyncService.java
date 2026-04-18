package com.login.GYMETRA.service;

import com.login.GYMETRA.entity.Role;
import com.login.GYMETRA.entity.User;
import com.login.GYMETRA.entity.UserRole;
import com.login.GYMETRA.repository.RoleRepository;
import com.login.GYMETRA.repository.UserRepository;
import com.login.GYMETRA.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Synchronises the local {@link User} record with the identity provided by
 * AWS Cognito on every authenticated request.
 *
 * <p><strong>Strategy (find-or-create by sub):</strong>
 * <ol>
 *   <li>Look up the user by the stable {@code sub} claim.</li>
 *   <li>If found, update mutable fields (email, lastLogin).</li>
 *   <li>If not found, create a minimal profile and assign the default role.</li>
 * </ol>
 *
 * <p>Using {@code sub} instead of {@code email} avoids duplicates when a user
 * changes their email address in Cognito.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CognitoUserSyncService {

    private static final String DEFAULT_ROLE = "Client";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    // ---------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------

    /**
     * Returns the local {@link User} that corresponds to the given Cognito JWT,
     * creating one if it does not yet exist.
     *
     * @param jwt the validated Cognito JWT from the current request
     * @return the local user record (never {@code null})
     */
    @Transactional
    public User syncUser(Jwt jwt) {
        String sub   = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String given = jwt.getClaimAsString("given_name");
        String family = jwt.getClaimAsString("family_name");

        return userRepository.findByCognitoSub(sub)
                .map(existing -> updateExisting(existing, email))
                .orElseGet(() -> createNew(sub, email, given, family));
    }

    // ---------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------

    private User updateExisting(User user, String email) {
        if (email != null && !email.equals(user.getEmail())) {
            log.info("Cognito email changed for sub={} → updating local record", user.getCognitoSub());
            user.setEmail(email);
        }
        user.setLastLogin(OffsetDateTime.now());
        return userRepository.save(user);
    }

    private User createNew(String sub, String email, String given, String family) {
        log.info("Creating local profile for new Cognito user sub={}", sub);

        Role clientRole = roleRepository.findByRoleName(DEFAULT_ROLE)
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .roleName(DEFAULT_ROLE)
                                .description("Cliente del gimnasio")
                                .build()
                ));

        User user = User.builder()
                .cognitoSub(sub)
                .email(email != null ? email : sub + "@cognito.local")
                .firstName(given  != null ? given  : "")
                .lastName(family != null ? family : "")
                .status("active")
                .createdAt(OffsetDateTime.now())
                .lastLogin(OffsetDateTime.now())
                // passwordHash is intentionally null — authentication is handled by Cognito
                .build();

        User saved = userRepository.save(user);

        UserRole userRole = UserRole.builder()
                .user(saved)
                .role(clientRole)
                .build();
        userRoleRepository.save(userRole);

        Set<UserRole> roles = new HashSet<>();
        roles.add(userRole);
        saved.setUserRoles(roles);

        return saved;
    }
}
