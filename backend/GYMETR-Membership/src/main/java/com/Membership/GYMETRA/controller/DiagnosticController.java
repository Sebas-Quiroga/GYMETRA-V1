package com.Membership.GYMETRA.controller;

import com.Membership.GYMETRA.entity.Payment;
import com.Membership.GYMETRA.entity.UserMembership;
import com.Membership.GYMETRA.entity.UserMembershipStatus;
import com.Membership.GYMETRA.entity.Membership;
import com.Membership.GYMETRA.service.PaymentService;
import com.Membership.GYMETRA.service.UserMembershipService;
import com.Membership.GYMETRA.service.MembershipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/diagnostic")
@CrossOrigin(origins = {"http://localhost:5501", "http://localhost:8100", "http://localhost:3000", "http://localhost:8081"}, allowCredentials = "true")
@Tag(name = "Diagnóstico", description = "Controlador para pruebas y diagnóstico del sistema")
public class DiagnosticController {

    private final PaymentService paymentService;
    private final UserMembershipService userMembershipService;
    private final MembershipService membershipService;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public DiagnosticController(PaymentService paymentService, 
                              UserMembershipService userMembershipService,
                              MembershipService membershipService) {
        this.paymentService = paymentService;
        this.userMembershipService = userMembershipService;
        this.membershipService = membershipService;
    }

    @Operation(summary = "Probar creación de pago", description = "Ejecuta una prueba de creación de pago para verificar el funcionamiento del sistema")
    @PostMapping("/test-payment")
    public ResponseEntity<?> testPaymentCreation() {
        try {
            System.out.println("🧪 DIAGNÓSTICO: Iniciando prueba de creación de pago...");

            // 1. Obtener una membresía existente
            Optional<Membership> membershipOpt = membershipService.getMembershipById(1);
            if (membershipOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("No se encontró membresía con ID 1");
            }
            Membership membership = membershipOpt.get();

            // 2. Crear un UserMembership de prueba
            UserMembership userMembership = UserMembership.builder()
                .userId(999) // Usuario de prueba
                .membership(membership)
                .status(UserMembershipStatus.ACTIVE)
                .startDate(LocalDateTime.now().toLocalDate())
                .endDate(LocalDateTime.now().plusDays(30).toLocalDate())
                .createdAt(LocalDateTime.now())
                .build();

            UserMembership savedMembership = userMembershipService.createOrUpdateMembership(userMembership);
            System.out.println("✅ UserMembership creado: " + savedMembership.getId());

            // 3. Crear Payment de prueba usando la MISMA lógica que el PaymentController
            LocalDateTime now = LocalDateTime.now();
            System.out.println("📅 Estableciendo paymentDate a: " + now);

            Payment payment = new Payment();
            payment.setUserMembership(savedMembership);
            payment.setPaymentDate(now);
            payment.setAmount(new BigDecimal("100.00"));
            payment.setPaymentMethod(Payment.PaymentMethod.GATEWAY);
            payment.setPaymentStatus(Payment.PaymentStatus.CONFIRMED);
            payment.setTransactionReference("DIAGNOSTIC_TEST_" + System.currentTimeMillis());
            payment.setCreatedAt(LocalDateTime.now());
            payment.setUpdatedAt(LocalDateTime.now());

            System.out.println("💰 Payment antes de guardar:");
            System.out.println("  - paymentDate: " + payment.getPaymentDate());
            System.out.println("  - amount: " + payment.getAmount());
            System.out.println("  - userMembership: " + payment.getUserMembership().getId());
            System.out.println("  - createdAt: " + payment.getCreatedAt());
            System.out.println("  - updatedAt: " + payment.getUpdatedAt());

            Payment savedPayment = paymentService.createPayment(payment);
            
            System.out.println("✅ Payment guardado exitosamente con ID: " + savedPayment.getId());

            return ResponseEntity.ok("Pago de prueba creado exitosamente. ID: " + savedPayment.getId());

        } catch (Exception e) {
            System.out.println("❌ Error en diagnóstico: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @Operation(summary = "Verificar estructura de tabla", description = "Consulta la estructura de la tabla payment en la base de datos")
    @GetMapping("/check-table-structure")
    public ResponseEntity<?> checkTableStructure() {
        try {
            String sql = """
                SELECT column_name, data_type, is_nullable, column_default, ordinal_position
                FROM information_schema.columns 
                WHERE table_name = 'payment' 
                ORDER BY ordinal_position
                """;
            
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
            
            System.out.println("🔍 Estructura de la tabla payment:");
            result.forEach(row -> {
                System.out.println("   " + row.get("ordinal_position") + ". " + 
                                 row.get("column_name") + " (" + 
                                 row.get("data_type") + ") - " +
                                 (row.get("is_nullable").equals("YES") ? "NULL" : "NOT NULL"));
            });
            
            return ResponseEntity.ok(Map.of(
                "message", "Estructura de tabla consultada exitosamente",
                "columns", result
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(summary = "Test simple de conexión", description = "Realiza una prueba básica de conexión a la base de datos")
    @GetMapping("/simple-test")
    public ResponseEntity<?> simpleTest() {
        try {
            System.out.println("🔍 Test simple de conexión...");
            
            // Probar solo la obtención de membresías
            Optional<Membership> membership = membershipService.getMembershipById(1);
            if (membership.isPresent()) {
                return ResponseEntity.ok("Conexión OK. Membresía encontrada: " + membership.get().getPlanName());
            } else {
                return ResponseEntity.badRequest().body("No se encontró membresía con ID 1");
            }
            
        } catch (Exception e) {
            System.out.println("❌ Error en test simple: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(summary = "Verificar membresías de usuario", description = "Consulta todas las membresías asociadas a un usuario específico")
    @GetMapping("/user-membership/{userId}")
    public ResponseEntity<?> checkUserMembership(@PathVariable Integer userId) {
        try {
            System.out.println("🔍 Verificando membresías del usuario: " + userId);
            
            List<UserMembership> memberships = userMembershipService.getUserMembershipsByUserId(userId);
            
            System.out.println("📊 Encontradas " + memberships.size() + " membresías:");
            for (UserMembership um : memberships) {
                System.out.println("  ID: " + um.getId());
                System.out.println("  Status: " + um.getStatus());
                System.out.println("  Start Date: " + um.getStartDate());
                System.out.println("  End Date: " + um.getEndDate());
                System.out.println("  Created At: " + um.getCreatedAt());
                System.out.println("  ---");
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Membresías encontradas: " + memberships.size(),
                "memberships", memberships,
                "debug", memberships.stream().map(um -> Map.of(
                    "id", um.getId(),
                    "status", um.getStatus(),
                    "startDate", um.getStartDate(),
                    "endDate", um.getEndDate(),
                    "createdAt", um.getCreatedAt()
                )).toList()
            ));
            
        } catch (Exception e) {
            System.out.println("❌ Error verificando membresías: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Operation(summary = "Verificar tabla user_membership", description = "Consulta la estructura de la tabla user_membership en la base de datos")
    @GetMapping("/check-user-membership-table")
    public ResponseEntity<?> checkUserMembershipTable() {
        try {
            String sql = """
                SELECT column_name, data_type, is_nullable, column_default, ordinal_position
                FROM information_schema.columns 
                WHERE table_name = 'user_membership' 
                ORDER BY ordinal_position
                """;
            
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
            
            System.out.println("🔍 Estructura de la tabla user_membership:");
            result.forEach(row -> {
                System.out.println("   " + row.get("ordinal_position") + ". " + 
                                 row.get("column_name") + " (" + 
                                 row.get("data_type") + ") - " +
                                 (row.get("is_nullable").equals("YES") ? "NULL" : "NOT NULL"));
            });
            
            return ResponseEntity.ok(Map.of(
                "message", "Estructura de tabla user_membership consultada",
                "columns", result
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}