package com.GYMETRA.GYMETRA.qr.repository;

import com.GYMETRA.GYMETRA.qr.entity.UserMin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserMinRepository extends JpaRepository<UserMin, Long> {
    Optional<UserMin> findByCognitoSub(String cognitoSub);
}
