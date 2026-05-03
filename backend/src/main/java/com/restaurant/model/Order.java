package com.restaurant.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.OrderType;

@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String userId;
    private String userName;
    private String userEmail;

    private List<OrderLine> items = new ArrayList<>();
    private double subtotal;
    private int discountPercent;
    private double discountAmount;
    private double totalPrice;

    private OrderStatus status;
    private OrderType type;
    private String deliveryAddress;

    private Instant createdAt;

    private boolean paid;
    private String cardId;
    private String cardLast4;

    private Instant estimatedCookingAt;
    private Instant estimatedReadyAt;
    private Instant estimatedCourierAt;
    private Instant estimatedDeliveryAt;

    public Order() {
        this.createdAt = Instant.now();
        this.status = OrderStatus.ACCEPTED;
        this.type = OrderType.PICKUP;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public List<OrderLine> getItems() { return items; }
    public void setItems(List<OrderLine> items) {
        this.items = (items != null) ? items : new ArrayList<>();
    }

    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }

    public double getSubtotal() { return subtotal; }
    public void setSubtotal(double subtotal) { this.subtotal = subtotal; }

    public int getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(int discountPercent) { this.discountPercent = discountPercent; }

    public double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(double discountAmount) { this.discountAmount = discountAmount; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public OrderType getType() { return type; }
    public void setType(OrderType type) { this.type = type; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getEstimatedCookingAt() { return estimatedCookingAt; }
    public void setEstimatedCookingAt(Instant t) { this.estimatedCookingAt = t; }

    public Instant getEstimatedReadyAt() { return estimatedReadyAt; }
    public void setEstimatedReadyAt(Instant t) { this.estimatedReadyAt = t; }

    public Instant getEstimatedCourierAt() { return estimatedCourierAt; }
    public void setEstimatedCourierAt(Instant t) { this.estimatedCourierAt = t; }

    public Instant getEstimatedDeliveryAt() { return estimatedDeliveryAt; }
    public void setEstimatedDeliveryAt(Instant t) { this.estimatedDeliveryAt = t; }

    public boolean isPaid() { return paid; }
    public void setPaid(boolean paid) { this.paid = paid; }

    public String getCardId() { return cardId; }
    public void setCardId(String cardId) { this.cardId = cardId; }

    public String getCardLast4() { return cardLast4; }
    public void setCardLast4(String cardLast4) { this.cardLast4 = cardLast4; }
}
