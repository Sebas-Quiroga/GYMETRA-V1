package com.Membership.GYMETRA.repository;

import com.Membership.GYMETRA.entity.UserMembership;
import com.Membership.GYMETRA.entity.UserMembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserMembershipRepository extends JpaRepository<UserMembership, Integer> {

    // Obtener todas las memberships de un usuario con su plan cargado (Eager fetch para evitar 500 en serialización)
    @org.springframework.data.jpa.repository.Query("SELECT um FROM UserMembership um JOIN FETCH um.membership WHERE um.userId = :userId")
    List<UserMembership> findByUserId(@org.springframework.data.repository.query.Param("userId") Integer userId);

    // Obtener todas las memberships de un usuario ordenadas por fecha de fin
    // descendente
    List<UserMembership> findByUserIdOrderByEndDateDesc(Integer userId);

    // Comprobar si existe una membresía pendiente (u otro estado) para un usuario
    boolean existsByUserIdAndStatus(Integer userId, UserMembershipStatus status);

    // Encontrar todas las membresías con un estado específico creadas antes de
    // cierta fecha (para limpiar PENDING)
    List<UserMembership> findByStatusAndCreatedAtBefore(UserMembershipStatus status, LocalDateTime dateTime);

    // Listar todos menos los eliminados lógicamente
    List<UserMembership> findAllByStatusNot(UserMembershipStatus status);
}
