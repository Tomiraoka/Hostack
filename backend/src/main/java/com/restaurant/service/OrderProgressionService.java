package com.restaurant.service;

import java.time.Instant;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.restaurant.enums.OrderStatus;
import com.restaurant.model.Order;
import com.restaurant.repository.OrderRepository;

@Service
public class OrderProgressionService {

    private final OrderRepository orderRepository;

    public OrderProgressionService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Scheduled(fixedDelayString = "${restaurant.delivery.scheduler-interval-ms:10000}",
               initialDelay = 5000)
    public void advanceOrders() {
        List<Order> activeOrders = orderRepository.findByStatusNot(OrderStatus.DELIVERED);
        if (activeOrders.isEmpty()) return;

        Instant now = Instant.now();
        int advanced = 0;

        for (Order order : activeOrders) {
            if (advanceIfDue(order, now)) {
                orderRepository.save(order);
                advanced++;
            }
        }

        if (advanced > 0) {
            System.out.println("[scheduler] продвинуто заказов: " + advanced);
        }
    }

    private boolean advanceIfDue(Order order, Instant now) {
        OrderStatus original = order.getStatus();
        OrderStatus current = original;

        if (current == OrderStatus.ACCEPTED
                && order.getEstimatedCookingAt() != null
                && !now.isBefore(order.getEstimatedCookingAt())) {
            current = OrderStatus.COOKING;
        }

        if (current == OrderStatus.COOKING
                && order.getEstimatedReadyAt() != null
                && !now.isBefore(order.getEstimatedReadyAt())) {
            current = OrderStatus.READY;
        }

        if (current == OrderStatus.READY
                && order.getEstimatedDeliveryAt() != null
                && !now.isBefore(order.getEstimatedDeliveryAt())) {
            current = OrderStatus.DELIVERED;
        }

        if (current != original) {
            order.setStatus(current);
            return true;
        }
        return false;
    }
}
