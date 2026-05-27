package com.GYMETRA.GYMETRA.qr.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Minimal User entity for the QR service to map Cognito subs to local IDs.
 * Maps to the shared "user" table.
 */
@Entity
@Table(name = "\"user\"")
@Data
public class UserMin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "cognito_sub", unique = true)
    private String cognitoSub;

    @Column(name = "email")
    private String email;
}
