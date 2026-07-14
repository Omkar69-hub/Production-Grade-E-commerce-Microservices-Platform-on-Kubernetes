package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.RefreshToken;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends CrudRepository<RefreshToken, String> {
    Optional<RefreshToken> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
