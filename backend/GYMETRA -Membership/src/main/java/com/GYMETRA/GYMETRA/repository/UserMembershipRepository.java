package com.GYMETRA.GYMETRA.repository;

import com.GYMETRA.GYMETRA.entity.UserMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserMembershipRepository extends JpaRepository<UserMembership, Integer> {
    List<UserMembership> findByUserId(Integer userId);
}
