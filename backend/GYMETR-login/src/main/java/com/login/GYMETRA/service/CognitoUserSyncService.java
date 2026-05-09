package com.login.GYMETRA.service;

import com.login.GYMETRA.entity.Role;
import com.login.GYMETRA.entity.User;
import com.login.GYMETRA.entity.UserRole;
import com.login.GYMETRA.repository.RoleRepository;
import com.login.GYMETRA.repository.UserRepository;
import com.login.GYMETRA.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClientBuilder;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Optional;
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

    private static final String DEFAULT_ROLE = "User";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    @Value("${app.security.cognito.issuer}")
    private String issuerUri;

    @Value("${app.security.cognito.access-key:}")
    private String accessKey;

    @Value("${app.security.cognito.secret-key:}")
    private String secretKey;

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
        String email = jwt.getClaimAsString("email");
        Long identification = extractIdentification(jwt);

        log.debug("Syncing user for sub: {}, ident: {}, email: {}", sub, identification, email);

        // 1. Try finding by sub
        return userRepository.findByCognitoSub(sub)
                .map(user -> updateExistingUser(user, jwt))
                .orElseGet(() -> {
                    // 2. Try finding by identification (if present)
                    if (identification != null && identification > 0) {
                        return userRepository.findByIdentification(identification)
                                .map(user -> linkAndSyncUser(user, sub, jwt))
                                .orElseGet(() -> tryFindByEmailAndSync(email, sub, jwt));
                    }
                    return tryFindByEmailAndSync(email, sub, jwt);
                });
    }

    private User tryFindByEmailAndSync(String email, String sub, Jwt jwt) {
        if (email != null) {
            return userRepository.findByEmail(email)
                    .map(user -> linkAndSyncUser(user, sub, jwt))
                    .orElseGet(() -> createNewUser(jwt));
        }
        return createNewUser(jwt);
    }

    private User linkAndSyncUser(User user, String sub, Jwt jwt) {
        log.info("Linking existing user (email={}) with new Cognito sub: {}", user.getEmail(), sub);
        user.setCognitoSub(sub);
        return updateExistingUser(user, jwt);
    }

    /**
     * Scans the entire Cognito User Pool and imports missing users into local DB.
     * @return number of new users imported
     */
    @Transactional
    public int syncAllUsers() {
        String userPoolId = issuerUri.substring(issuerUri.lastIndexOf("/") + 1);
        // Region extraction: https://cognito-idp.us-east-2.amazonaws.com/... -> us-east-2
        String regionStr = issuerUri.split("\\.")[1];
        Region region = Region.of(regionStr);

        log.info("Starting full Cognito sync for Pool: {} in Region: {}", userPoolId, region);

        int importedCount = 0;
        try (CognitoIdentityProviderClient cognitoClient = createCognitoClient(region)) {

            ListUsersRequest listUsersRequest = ListUsersRequest.builder()
                    .userPoolId(userPoolId)
                    .build();

            ListUsersResponse response = cognitoClient.listUsers(listUsersRequest);
            
            for (UserType cognitoUser : response.users()) {
                UserAttributes attrs = extractAttributes(cognitoUser);
                
                if (attrs.sub == null) continue;

                // 1. Search by sub
                Optional<User> existing = userRepository.findByCognitoSub(attrs.sub);
                
                // 2. If not found, search by identification
                if (existing.isEmpty() && attrs.identification != null && attrs.identification > 0) {
                    existing = userRepository.findByIdentification(attrs.identification);
                    if (existing.isPresent()) {
                        log.info("Merging existing user by identification={} with Cognito sub={}", attrs.identification, attrs.sub);
                    }
                }

                // 3. If still not found, search by email
                if (existing.isEmpty() && attrs.email != null) {
                    existing = userRepository.findByEmail(attrs.email);
                    if (existing.isPresent()) {
                        log.info("Merging existing user by email={} with Cognito sub={}", attrs.email, attrs.sub);
                    }
                }

                if (existing.isPresent()) {
                    // Update existing
                    User user = existing.get();
                    user.setCognitoSub(attrs.sub); // Ensure sub is linked
                    updateUserFromAttributes(user, attrs);
                    userRepository.save(user); // Transactional handles saving, but good to be explicit
                } else {
                    // New import
                    importCognitoUser(attrs);
                    importedCount++;
                }
            }

        } catch (Exception e) {
            log.error("Failed to perform Cognito sync: {}", e.getMessage());
            throw new RuntimeException("Error sincronizando usuarios con Cognito: " + e.getMessage());
        }

        log.info("Full sync completed. {} new users imported.", importedCount);
        return importedCount;
    }

    private void importCognitoUser(UserAttributes attrs) {
        User newUser = User.builder()
                .cognitoSub(attrs.sub)
                .email(attrs.email != null ? attrs.email : attrs.sub + "@cognito.local")
                .firstName(attrs.firstName != null ? attrs.firstName : "Nuevo")
                .lastName(attrs.lastName != null ? attrs.lastName : "Usuario")
                .phone(attrs.phone)
                .photoUrl(attrs.photo)
                .identification(attrs.identification != null ? attrs.identification : 0L)
                .status("active")
                .createdAt(OffsetDateTime.now())
                .lastLogin(OffsetDateTime.now())
                .build();

        saveUserWithDefaultRole(newUser);
    }

    private void updateUserFromAttributes(User user, UserAttributes attrs) {
        if (attrs.email != null) user.setEmail(attrs.email);
        if (attrs.firstName != null) user.setFirstName(attrs.firstName);
        if (attrs.lastName != null) user.setLastName(attrs.lastName);
        if (attrs.phone != null) user.setPhone(attrs.phone);
        if (attrs.photo != null) user.setPhotoUrl(attrs.photo);
        if (attrs.identification != null && attrs.identification > 0) user.setIdentification(attrs.identification);
        user.setLastLogin(OffsetDateTime.now());
    }

    private UserAttributes extractAttributes(UserType cognitoUser) {
        UserAttributes attrs = new UserAttributes();
        for (AttributeType attr : cognitoUser.attributes()) {
            switch (attr.name()) {
                case "sub" -> attrs.sub = attr.value();
                case "email" -> attrs.email = attr.value();
                case "given_name" -> attrs.firstName = attr.value();
                case "family_name" -> attrs.lastName = attr.value();
                case "phone_number" -> attrs.phone = attr.value();
                case "picture" -> attrs.photo = attr.value();
                case "custom:identification", "preferred_username" -> {
                    try {
                        attrs.identification = Long.parseLong(attr.value().replaceAll("[^0-9]", ""));
                    } catch (Exception ignored) {}
                }
            }
        }
        return attrs;
    }

    private Long extractIdentification(Jwt jwt) {
        String identStr = jwt.getClaimAsString("custom:identification");
        if (identStr == null) identStr = jwt.getClaimAsString("preferred_username");
        try {
            return identStr != null ? Long.parseLong(identStr.replaceAll("[^0-9]", "")) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private static class UserAttributes {
        String sub, email, firstName, lastName, phone, photo;
        Long identification = 0L;
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

        Role userRole = getOrCreateRoleWithPriority(DEFAULT_ROLE);

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

        UserRole userRoleRel = UserRole.builder()
                .user(saved)
                .role(userRole)
                .build();
        userRoleRepository.save(userRoleRel);

        Set<UserRole> roles = new HashSet<>();
        roles.add(userRoleRel);
        saved.setUserRoles(roles);

        return saved;
    }

    private void saveUserWithDefaultRole(User user) {
        Role userRole = getOrCreateRoleWithPriority(DEFAULT_ROLE);

        User saved = userRepository.save(user);

        UserRole userRoleRel = UserRole.builder()
                .user(saved)
                .role(userRole)
                .build();
        userRoleRepository.save(userRoleRel);

        Set<UserRole> roles = new HashSet<>();
        roles.add(userRoleRel);
        saved.setUserRoles(roles);
    }

    private CognitoIdentityProviderClient createCognitoClient(Region region) {
        CognitoIdentityProviderClientBuilder builder = CognitoIdentityProviderClient.builder()
                .region(region);

        if (accessKey != null && !accessKey.isBlank() && secretKey != null && !secretKey.isBlank()) {
            log.info("Configuring Cognito client with static credentials from application properties.");
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)
            ));
        } else {
            log.info("Using default AWS credentials provider chain for Cognito client.");
        }

        return builder.build();
    }

    private Role getOrCreateRoleWithPriority(String roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseGet(() -> {
                    int priority = roleName.equalsIgnoreCase("Admin") ? 1 : 10;
                    String description = roleName.equalsIgnoreCase("Admin") ? "Administrador del sistema" : "Usuario estándar";
                    return roleRepository.save(
                            Role.builder()
                                    .roleName(roleName)
                                    .description(description)
                                    .priority(priority)
                                    .build()
                    );
                });
    }
}
