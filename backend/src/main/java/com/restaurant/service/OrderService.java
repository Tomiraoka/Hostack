package com.restaurant.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.restaurant.dto.OrderRequest;
import com.restaurant.enums.OrderStatus;
import com.restaurant.model.Card;
import com.restaurant.model.MenuItem;
import com.restaurant.model.Order;
import com.restaurant.model.OrderLine;
import com.restaurant.model.User;
import com.restaurant.repository.MenuRepository;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.UserRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuRepository menuRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final CardService cardService;
    private final LoyaltyService loyaltyService;

    @Value("${restaurant.delivery.accept-to-cook-minutes:1}")
    private int acceptToCookMinutes;

    @Value("${restaurant.delivery.fallback-cook-minutes:10}")
    private int fallbackCookMinutes;

    @Value("${restaurant.delivery.ready-to-delivered-minutes:5}")
    private int readyToDeliveredMinutes;

    public OrderService(OrderRepository orderRepository,
                        MenuRepository menuRepository,
                        UserRepository userRepository,
                        InventoryService inventoryService,
                        CardService cardService,
                        LoyaltyService loyaltyService) {
        this.orderRepository = orderRepository;
        this.menuRepository = menuRepository;
        this.userRepository = userRepository;
        this.inventoryService = inventoryService;
        this.cardService = cardService;
        this.loyaltyService = loyaltyService;
    }

    public Order createOrder(OrderRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Заказ должен содержать хотя бы одно блюдо");
        }
        if (request.getUserId() == null || request.getUserId().isEmpty()) {
            throw new IllegalArgumentException("Не указан пользователь — войдите в аккаунт");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

        if (request.getDeliveryAddress() == null || request.getDeliveryAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Укажите адрес для доставки");
        }
        String deliveryAddress = request.getDeliveryAddress().trim();

        Map<MenuItem, Integer> menuItemsWithQty = new HashMap<>();
        List<OrderLine> orderLines = new ArrayList<>();
        double subtotal = 0;
        int maxPrepTime = 0;

        for (OrderRequest.OrderItemRequest req : request.getItems()) {
            if (req.getQuantity() <= 0) continue;

            MenuItem menuItem = menuRepository.findById(req.getMenuItemId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Блюдо не найдено: " + req.getMenuItemId()));

            menuItemsWithQty.merge(menuItem, req.getQuantity(), Integer::sum);

            int prepTime = Math.max(1, menuItem.getPreparationTime());

            orderLines.add(new OrderLine(
                    menuItem.getId(),
                    menuItem.getName(),
                    menuItem.getPrice(),
                    req.getQuantity(),
                    prepTime
            ));
            subtotal += menuItem.getPrice() * req.getQuantity();

            if (prepTime > maxPrepTime) {
                maxPrepTime = prepTime;
            }
        }

        if (orderLines.isEmpty()) {
            throw new IllegalArgumentException("Заказ пустой");
        }
        if (maxPrepTime <= 0) maxPrepTime = fallbackCookMinutes;

        int discountPercent = loyaltyService.getDiscountPercentForUser(user.getId());
        double discountAmount = Math.round(subtotal * discountPercent / 100.0);
        double totalPrice = subtotal - discountAmount;

        Card card = null;
        if (request.getCardId() != null && !request.getCardId().isBlank()) {
            card = cardService.requireOwnedCard(request.getCardId(), user.getId());
            if (card.getBalance() < totalPrice) {
                throw new IllegalArgumentException(String.format(
                        "Недостаточно средств на карте •••• %s. Доступно: %.0f₸, требуется: %.0f₸",
                        last4(card.getCardNumber()), card.getBalance(), totalPrice));
            }
        }

        inventoryService.ensureInventoryAvailable(menuItemsWithQty);
        inventoryService.reduceInventory(menuItemsWithQty);

        if (card != null) {
            cardService.chargeCard(card, totalPrice);
        }

        Order order = new Order();
        order.setUserId(user.getId());
        order.setUserName(user.getName());
        order.setUserEmail(user.getEmail());
        order.setItems(orderLines);
        order.setSubtotal(subtotal);
        order.setDiscountPercent(discountPercent);
        order.setDiscountAmount(discountAmount);
        order.setTotalPrice(totalPrice);
        order.setStatus(OrderStatus.ACCEPTED);
        order.setDeliveryAddress(deliveryAddress);

        if (card != null) {
            order.setPaid(true);
            order.setCardId(card.getId());
            order.setCardLast4(last4(card.getCardNumber()));
        } else {
            order.setPaid(false);
        }

        Instant created = order.getCreatedAt();
        Instant cookingAt = created.plus(acceptToCookMinutes, ChronoUnit.MINUTES);
        Instant readyAt = cookingAt.plus(maxPrepTime, ChronoUnit.MINUTES);
        Instant deliveredAt = readyAt.plus(readyToDeliveredMinutes, ChronoUnit.MINUTES);

        order.setEstimatedCookingAt(cookingAt);
        order.setEstimatedReadyAt(readyAt);
        order.setEstimatedDeliveryAt(deliveredAt);

        for (OrderLine line : orderLines) {
            line.setStartsAt(readyAt.minus(line.getPrepTime(), ChronoUnit.MINUTES));
        }

        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Order> getOrdersByUser(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Order updateOrderStatus(String orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Заказ не найден"));
        if (newStatus == order.getStatus()) {
            return order;
        }
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    public double getTotalRevenue() {
        return orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .mapToDouble(Order::getTotalPrice)
                .sum();
    }

    public long getTotalOrdersCount() {
        return orderRepository.count();
    }

    public long getDeliveredOrdersCount() {
        return orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .count();
    }

    private String last4(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) return "----";
        return cardNumber.substring(cardNumber.length() - 4);
    }
}
