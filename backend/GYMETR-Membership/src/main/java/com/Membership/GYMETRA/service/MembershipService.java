package com.Membership.GYMETRA.service;

import com.Membership.GYMETRA.entity.Membership;
import com.Membership.GYMETRA.repository.MembershipRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MembershipService {

    private final MembershipRepository membershipRepository;

    public MembershipService(MembershipRepository membershipRepository) {
        this.membershipRepository = membershipRepository;
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
}
