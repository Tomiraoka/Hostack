package com.restaurant.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.OrderType;
import com.restaurant.model.Order;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByTypeAndStatusNot(OrderType type, OrderStatus status);
}
