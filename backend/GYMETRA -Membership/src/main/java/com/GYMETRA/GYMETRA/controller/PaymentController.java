package com.GYMETRA.GYMETRA.controller;

import com.GYMETRA.GYMETRA.entity.Payment;
import com.GYMETRA.GYMETRA.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // Crear pago
    @PostMapping
    public ResponseEntity<Payment> create(@RequestBody Payment payment) {
        return ResponseEntity.ok(paymentService.createPayment(payment));
    }

    // Listar todos los pagos
    @GetMapping
    public ResponseEntity<List<Payment>> listAll() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // Obtener pago por ID
    @GetMapping("/{id}")
    public ResponseEntity<Payment> getById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    // Obtener pagos por usuario
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Payment>> getByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(paymentService.getPaymentsByUserId(userId));
    }

    // Actualizar estado del pago
    @PatchMapping("/{id}/status")
    public ResponseEntity<Payment> updateStatus(@PathVariable Long id,
                                                @RequestParam Payment.PaymentStatus status) {
        return ResponseEntity.ok(paymentService.updatePaymentStatus(id, status));
    }

    // Eliminar pago
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}
