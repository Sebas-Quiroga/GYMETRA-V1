package com.GYMETRA.GYMETRA.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Long paymentId; // id_pago

    @ManyToOne
    @JoinColumn(name = "user_membership_id", nullable = false)
    private UserMembership userMembership; // FK a UserMembership

    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime paymentDate; // fecha_pago

    @Positive
    @Column(name = "monto", nullable = false)
    private BigDecimal amount; // monto

    public enum PaymentMethod { CASH, CARD, GATEWAY }

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false)
    private PaymentMethod paymentMethod; // cash/card/gateway

    @Column(name = "referencia_transaccion", length = 100)
    private String transactionReference; // referencia_transacción

    public enum PaymentStatus { PENDING, CONFIRMED, FAILED }

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pago", nullable = false)
    private PaymentStatus paymentStatus; // pending/confirmed/failed

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
