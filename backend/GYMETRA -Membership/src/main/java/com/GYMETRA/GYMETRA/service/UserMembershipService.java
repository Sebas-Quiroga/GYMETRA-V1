package com.GYMETRA.GYMETRA.service;

import com.GYMETRA.GYMETRA.entity.Membership;
import com.GYMETRA.GYMETRA.entity.UserMembership;
import com.GYMETRA.GYMETRA.repository.UserMembershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserMembershipService {

    @Autowired
    private UserMembershipRepository userMembershipRepository;

    public UserMembership createUserMembership(Integer userId, Membership membership) {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(membership.getDurationDays());

        UserMembership userMembership = UserMembership.builder()
                .userId(userId)
                .membership(membership)
                .startDate(start)
                .endDate(end)
                .status(UserMembership.Status.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        return userMembershipRepository.save(userMembership);
    }

    public List<UserMembership> getUserMembershipsByUserId(Integer userId) {
        return userMembershipRepository.findByUserId(userId);
    }

    public UserMembership getById(Integer id) {
        return userMembershipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("UserMembership no encontrado"));
    }

    public UserMembership updateStatus(Integer id, UserMembership.Status status) {
        UserMembership um = getById(id);
        um.setStatus(status);
        return userMembershipRepository.save(um);
    }

    public void deleteUserMembership(Integer id) {
        userMembershipRepository.deleteById(id);
    }
}
