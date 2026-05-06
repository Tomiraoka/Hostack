package com.restaurant.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.restaurant.model.RefreshToken;

public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUserId(String userId);
}
