package com.login.GYMETRA.service;

import com.login.GYMETRA.dto.EditUserRequest;
import com.login.GYMETRA.entity.Role;
import com.login.GYMETRA.entity.User;
import com.login.GYMETRA.entity.UserRole;
import com.login.GYMETRA.repository.RoleRepository;
import com.login.GYMETRA.repository.UserRepository;
import com.login.GYMETRA.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Application-layer service for {@link User} CRUD operations.
 *
 * <p><strong>Authentication is NOT handled here</strong> — it is the
 * responsibility of AWS Cognito.  This service only manages user data
 * stored in the local database.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final CognitoUserSyncService cognitoUserSyncService;

    // ==============================================================
    // SYNC
    // ==============================================================

    /** Scans Cognito and imports missing users. */
    public int syncAllUsersFromCognito() {
        return cognitoUserSyncService.syncAllUsers();
    }

    // ==============================================================
    // READ
    // ==============================================================

    /** Returns all users ordered by ID ascending. */
    public List<User> getAllUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "userId"));
    }

    /** Finds a single user by its local primary key. */
    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }

    // ==============================================================
    // UPDATE
    // ==============================================================

    /**
     * Updates the mutable fields of an existing user.
     *
     * @return the updated {@link User}, or empty if the user was not found
     */
    @Transactional
    public Optional<User> editUserById(Long userId, EditUserRequest request) {
        return userRepository.findById(userId).map(user -> {

            // Verify email uniqueness before updating
            if (request.getEmail() != null
                    && !request.getEmail().equals(user.getEmail())
                    && userRepository.existsByEmail(request.getEmail())) {
                throw new UserAlreadyExistsException("El email ya está registrado por otro usuario");
            }

            if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
            if (request.getLastName()  != null) user.setLastName(request.getLastName());
            if (request.getEmail()     != null) user.setEmail(request.getEmail());
            if (request.getPhone()     != null) user.setPhone(request.getPhone());
            if (request.getPhotoUrl()  != null) user.setPhotoUrl(request.getPhotoUrl());

            // Role update
            if (request.getRoleId() != null) {
                Role newRole = roleRepository.findById(request.getRoleId())
                        .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado"));

                List<UserRole> userRoles = userRoleRepository.findByUser_UserId(userId);
                if (!userRoles.isEmpty()) {
                    userRoles.get(0).setRole(newRole);
                    userRoleRepository.save(userRoles.get(0));
                } else {
                    userRoleRepository.save(UserRole.builder()
                            .user(user).role(newRole).build());
                }
            }

            return userRepository.save(user);
        });
    }

    // ==============================================================
    // DELETE
    // ==============================================================

    /**
     * Deletes a user by ID.
     *
     * @return {@code true} if deleted, {@code false} if not found
     */
    @Transactional
    public boolean deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) return false;
        userRepository.deleteById(userId);
        return true;
    }

    // ==============================================================
    // STATUS
    // ==============================================================

    /**
     * Changes a user's account status.
     *
     * @param status must be {@code "active"} or {@code "suspended"}
     * @return {@code true} if updated, {@code false} if user not found or status invalid
     */
    @Transactional
    public boolean updateUserStatus(Long userId, String status) {
        if (!"active".equals(status) && !"suspended".equals(status)) return false;

        return userRepository.findById(userId).map(user -> {
            user.setStatus(status);
            userRepository.save(user);
            return true;
        }).orElse(false);
    }

    // ==============================================================
    // Custom exceptions
    // ==============================================================

    public static class UserAlreadyExistsException extends RuntimeException {
        public UserAlreadyExistsException(String message) {
            super(message);
        }
    }
}
