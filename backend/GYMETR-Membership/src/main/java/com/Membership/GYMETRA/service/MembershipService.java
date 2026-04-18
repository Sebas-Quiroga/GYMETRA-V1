package com.Membership.GYMETRA.service;

import com.Membership.GYMETRA.entity.Membership;
import com.Membership.GYMETRA.entity.UserMembership;
import com.Membership.GYMETRA.repository.MembershipRepository;
import com.Membership.GYMETRA.repository.UserMembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MembershipService {

    private final MembershipRepository membershipRepository;
    private final UserMembershipRepository userMembershipRepository;

    /**
     * Listar membresías disponibles para la venta (con estado ACTIVE o available).
     */
    public List<Membership> getAvailableMemberships() {
        return membershipRepository.findAll().stream()
                .filter(m -> "ACTIVE".equalsIgnoreCase(m.getStatus()) || "available".equalsIgnoreCase(m.getStatus()))
                .collect(Collectors.toList());
    }

    // Listar todas las membresías
    public List<Membership> getAllMemberships() {
        return membershipRepository.findAll();
    }

    // Obtener una membresía por ID
    public Optional<Membership> getMembershipById(Integer id) {
        return membershipRepository.findById(id);
    }

    // Crear o actualizar una membresía
    public Membership saveMembership(Membership membership) {
        return membershipRepository.save(membership);
    }

    // Eliminar una membresía
    public void deleteMembership(Integer id) {
        membershipRepository.deleteById(id);
    }

    // Obtener todas las membresías de usuario
    public List<UserMembership> getAllUserMemberships() {
        return userMembershipRepository.findAll();
    }
}
