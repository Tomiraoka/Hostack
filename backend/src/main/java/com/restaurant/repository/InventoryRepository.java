package com.restaurant.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.restaurant.model.InventoryItem;

public interface InventoryRepository extends MongoRepository<InventoryItem, String> {
    Optional<InventoryItem> findByName(String name);
}
