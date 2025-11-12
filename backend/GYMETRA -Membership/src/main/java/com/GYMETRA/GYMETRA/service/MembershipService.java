package com.GYMETRA.GYMETRA.service;

import com.GYMETRA.GYMETRA.entity.Membership;
import com.GYMETRA.GYMETRA.repository.MembershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MembershipService {

    @Autowired
    private MembershipRepository membershipRepository;

    public Membership createMembership(Membership membership) {
        if (membershipRepository.existsByPlanName(membership.getPlanName())) {
            throw new RuntimeException("Ya existe un plan con este nombre");
        }
        return membershipRepository.save(membership);
    }

    public List<Membership> getAllMemberships() {
        return membershipRepository.findAll();
    }

    public Membership getMembershipById(Integer id) {
        return membershipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membresía no encontrada"));
    }

    public Membership updateMembership(Integer id, Membership membership) {
        Membership existing = getMembershipById(id);
        existing.setPlanName(membership.getPlanName());
        existing.setDurationDays(membership.getDurationDays());
        existing.setPrice(membership.getPrice());
        existing.setStatus(membership.getStatus());
        existing.setDescription(membership.getDescription());
        return membershipRepository.save(existing);
    }

    public void deleteMembership(Integer id) {
        membershipRepository.deleteById(id);
    }
}
