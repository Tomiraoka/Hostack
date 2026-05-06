package com.restaurant.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.restaurant.model.MenuItem;

public interface MenuRepository extends MongoRepository<MenuItem, String> {
}
