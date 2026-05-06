package com.restaurant.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.restaurant.dto.LoyaltyResponse;
import com.restaurant.model.Order;
import com.restaurant.repository.OrderRepository;

@Service
public class LoyaltyService {

    @Value("${restaurant.loyalty.bronze-orders:3}")
    private int bronzeThreshold;

    @Value("${restaurant.loyalty.silver-orders:8}")
    private int silverThreshold;

    @Value("${restaurant.loyalty.gold-orders:15}")
    private int goldThreshold;

    @Value("${restaurant.loyalty.bronze-discount:5}")
    private int bronzeDiscount;

    @Value("${restaurant.loyalty.silver-discount:10}")
    private int silverDiscount;

    @Value("${restaurant.loyalty.gold-discount:15}")
    private int goldDiscount;

    private final OrderRepository orderRepository;

    public LoyaltyService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public LoyaltyResponse getLoyaltyInfo(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("Не указан пользователь");
        }
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        int ordersCount = orders.size();
        double totalSpent = orders.stream().mapToDouble(Order::getTotalPrice).sum();

        return buildResponse(ordersCount, totalSpent);
    }

    public int getDiscountPercentForUser(String userId) {
        if (userId == null) return 0;
        int ordersCount = orderRepository.findByUserIdOrderByCreatedAtDesc(userId).size();
        return discountForOrdersCount(ordersCount);
    }

    private int discountForOrdersCount(int count) {
        if (count >= goldThreshold) return goldDiscount;
        if (count >= silverThreshold) return silverDiscount;
        if (count >= bronzeThreshold) return bronzeDiscount;
        return 0;
    }

    private LoyaltyResponse buildResponse(int ordersCount, double totalSpent) {
        LoyaltyResponse r = new LoyaltyResponse();
        r.setOrdersCount(ordersCount);
        r.setTotalSpent(totalSpent);

        if (ordersCount >= goldThreshold) {
            r.setTier("GOLD");
            r.setTierName("Золото");
            r.setDiscountPercent(goldDiscount);

        } else if (ordersCount >= silverThreshold) {
            r.setTier("SILVER");
            r.setTierName("Серебро");
            r.setDiscountPercent(silverDiscount);
            r.setNextTier("GOLD");
            r.setNextTierName("Золото");
            r.setNextTierDiscount(goldDiscount);
            r.setOrdersToNextTier(goldThreshold - ordersCount);
        } else if (ordersCount >= bronzeThreshold) {
            r.setTier("BRONZE");
            r.setTierName("Бронза");
            r.setDiscountPercent(bronzeDiscount);
            r.setNextTier("SILVER");
            r.setNextTierName("Серебро");
            r.setNextTierDiscount(silverDiscount);
            r.setOrdersToNextTier(silverThreshold - ordersCount);
        } else {
            r.setTier("NEWCOMER");
            r.setTierName("Новичок");
            r.setDiscountPercent(0);
            r.setNextTier("BRONZE");
            r.setNextTierName("Бронза");
            r.setNextTierDiscount(bronzeDiscount);
            r.setOrdersToNextTier(bronzeThreshold - ordersCount);
        }

        return r;
    }
}
