package com.Membership.GYMETRA.service;

import com.Membership.GYMETRA.entity.UserMembership;
import com.Membership.GYMETRA.repository.UserMembershipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class UserMembershipService {

    private final UserMembershipRepository repository;

    public UserMembershipService(UserMembershipRepository repository) {
        this.repository = repository;
    }

    // =====================================
    // 1️⃣ Crear o actualizar membresía
    // =====================================
    @Transactional
    public UserMembership createOrUpdateMembership(UserMembership newMembership) {
        Integer userId = newMembership.getUserId();

        // Validación de fechas
        if (newMembership.getStartDate() != null && newMembership.getEndDate() != null &&
                newMembership.getEndDate().isBefore(newMembership.getStartDate())) {
            throw new IllegalArgumentException("La fecha de fin no puede ser antes de la fecha de inicio.");
        }

        // 1️⃣ Verificar si hay membresía PENDING
        if (repository.existsByUserIdAndStatus(userId, UserMembership.Status.PENDING)) {
            throw new IllegalStateException("El usuario ya tiene una membresía pendiente.");
        }

        // 2️⃣ Buscar la última membresía del usuario
        List<UserMembership> memberships = repository.findByUserIdOrderByEndDateDesc(userId);

        if (!memberships.isEmpty()) {
            UserMembership last = memberships.get(0);

            switch (last.getStatus()) {
                case EXPIRED:
                    // Si la última está EXPIRED, actualizamos fecha fin y activamos
                    last.setEndDate(newMembership.getEndDate());
                    last.setStatus(UserMembership.Status.ACTIVE);
                    last.setStartDate(newMembership.getStartDate()); // opcional: actualizar fecha inicio
                    last.setCreatedAt(LocalDateTime.now());
                    return repository.save(last);

                case CANCELED:
                    // Si estaba CANCELED, solo actualizamos fecha fin
                    last.setEndDate(newMembership.getEndDate());
                    last.setCreatedAt(LocalDateTime.now());
                    return repository.save(last);

                default:
                    break;
            }
        }

        // 3️⃣ Si no hay membresías anteriores EXPIRED o CANCELED, crear nueva con el estado proporcionado
        // Solo forzar PENDING si el estado proporcionado es null o si hay validaciones específicas
        if (newMembership.getStatus() == null) {
            newMembership.setStatus(UserMembership.Status.PENDING);
        }
        // Respetamos el estado que se pasa (ACTIVE cuando el pago ya está confirmado)
        newMembership.setCreatedAt(LocalDateTime.now());
        
        System.out.println("🔄 CREANDO USER_MEMBERSHIP:");
        System.out.println("   📋 User ID: " + newMembership.getUserId());
        System.out.println("   📅 Start Date: " + newMembership.getStartDate());
        System.out.println("   📅 End Date: " + newMembership.getEndDate());
        System.out.println("   ✅ Status: " + newMembership.getStatus());
        System.out.println("   🏷️ Membership: " + newMembership.getMembership().getPlanName());
        
        UserMembership saved = repository.save(newMembership);
        
        System.out.println("✅ USER_MEMBERSHIP CREADO EXITOSAMENTE:");
        System.out.println("   📝 ID: " + saved.getId());
        System.out.println("   ✅ Status Final: " + saved.getStatus());
        
        return saved;
    }

    // =====================================
    // 2️⃣ Verificar si el usuario tiene pendiente
    // =====================================
    public boolean hasPendingMembership(Integer userId) {
        return repository.existsByUserIdAndStatus(userId, UserMembership.Status.PENDING);
    }

    // =====================================
    // 3️⃣ Eliminar membresías pendientes mayores a X minutos
    // =====================================
    public void deletePendingOlderThanMinutes(long minutes) {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(minutes);
        List<UserMembership> oldPending = repository.findByStatusAndCreatedAtBefore(UserMembership.Status.PENDING, threshold);
        repository.deleteAll(oldPending);
    }

    // =====================================
    // 4️⃣ Listar todas las membresías
    // =====================================
    public List<UserMembership> getAllUserMemberships() {
        return repository.findAll();
    }

    // =====================================
    // 5️⃣ Obtener membresía por ID
    // =====================================
    public Optional<UserMembership> getUserMembershipById(Integer id) {
        return repository.findById(id);
    }

    // =====================================
    // 6️⃣ Obtener membresías por usuario
    // =====================================
    public List<UserMembership> getUserMembershipsByUserId(Integer userId) {
        return repository.findByUserId(userId);
    }

    // =====================================
    // 7️⃣ Eliminar membresía
    // =====================================
    public boolean deleteUserMembership(Integer id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    // =====================================
    // 8️⃣ Obtener última membresía activa
    // =====================================
    public Optional<UserMembership> getLatestActiveMembership(Integer userId) {
        return getUserMembershipsByUserId(userId).stream()
                .filter(m -> m.getStatus() == UserMembership.Status.ACTIVE)
                .max(Comparator.comparing(UserMembership::getEndDate));
    }

    // =====================================
    // 9️⃣ Calcular días restantes de una membresía
    // =====================================
    public long getRemainingDays(UserMembership membership) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = membership.getEndDate();
        return ChronoUnit.DAYS.between(today, endDate);
    }
}
