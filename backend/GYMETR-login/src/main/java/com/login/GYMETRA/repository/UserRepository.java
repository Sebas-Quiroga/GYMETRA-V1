package com.login.GYMETRA.repository;

import com.login.GYMETRA.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByCognitoSub(String cognitoSub);
    Optional<User> findByIdentification(Long identification);
    boolean existsByEmail(String email);
    boolean existsByIdentification(Long identification);
    boolean existsByCognitoSub(String cognitoSub);
}
