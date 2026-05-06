package com.restaurant.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.restaurant.model.Card;

public interface CardRepository extends MongoRepository<Card, String> {
    List<Card> findByUserIdOrderByCreatedAtDesc(String userId);
}
