package com.GYMETRA.GYMETRA.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_membership")
public class UserMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // Identificador del user_membership

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "membership_id", nullable = false)
    @JsonBackReference // evita ciclos infinitos al serializar JSON
    private Membership membership;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    // 🔹 Nuevo campo para controlar la creación de membresías pendientes
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public enum Status {
        ACTIVE,
        SUSPENDED,
        CANCELED,
        EXPIRED,
        PENDING
    }
}
