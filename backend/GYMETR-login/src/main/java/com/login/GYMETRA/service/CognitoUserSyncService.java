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
        String sub = jwt.getSubject();
        log.debug("Syncing user for sub: {}", sub);

        return userRepository.findByCognitoSub(sub)
                .map(existingUser -> updateExistingUser(existingUser, jwt))
                .orElseGet(() -> createNewUser(jwt));
    }

    private User updateExistingUser(User user, Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        String givenName = jwt.getClaimAsString("given_name");
        String familyName = jwt.getClaimAsString("family_name");
        String phoneNumber = jwt.getClaimAsString("phone_number");
        String photo = jwt.getClaimAsString("picture");

        boolean modified = false;

        if (email != null && !email.equals(user.getEmail())) {
            user.setEmail(email);
            modified = true;
        }
        if (givenName != null && !givenName.equals(user.getFirstName())) {
            user.setFirstName(givenName);
            modified = true;
        }
        if (familyName != null && !familyName.equals(user.getLastName())) {
            user.setLastName(familyName);
            modified = true;
        }
        if (phoneNumber != null && !phoneNumber.equals(user.getPhone())) {
            user.setPhone(phoneNumber);
            modified = true;
        }
        if (photo != null && !photo.equals(user.getPhotoUrl())) {
            user.setPhotoUrl(photo);
            modified = true;
        }

        user.setLastLogin(OffsetDateTime.now());
        
        if (modified) {
            log.info("Profile attributes updated for synced user: {}", user.getEmail());
        }

        return userRepository.save(user);
    }

    private User createNewUser(Jwt jwt) {
        String sub = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String givenName = jwt.getClaimAsString("given_name");
        String familyName = jwt.getClaimAsString("family_name");
        String phoneNumber = jwt.getClaimAsString("phone_number");
        String photo = jwt.getClaimAsString("picture");
        
        // Intentar obtener identificación de custom:identification o preferred_username
        String identStr = jwt.getClaimAsString("custom:identification");
        if (identStr == null) identStr = jwt.getClaimAsString("preferred_username");
        
        Long identification = 0L;
        try {
            if (identStr != null) identification = Long.parseLong(identStr.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            log.warn("Could not parse identification '{}' for new user, defaulting to 0", identStr);
        }

        log.info("Creating local profile for new Cognito user email={}", email);

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
                .firstName(givenName != null ? givenName : "Nuevo")
                .lastName(familyName != null ? familyName : "Usuario")
                .phone(phoneNumber)
                .photoUrl(photo)
                .identification(identification)
                .status("active")
                .createdAt(OffsetDateTime.now())
                .lastLogin(OffsetDateTime.now())
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
