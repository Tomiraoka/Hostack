package com.restaurant.dto;

import java.util.List;

public class OrderRequest {

    private String userId;
    private List<OrderItemRequest> items;
    private String type;
    private String deliveryAddress;
    private String cardId;

    public OrderRequest() {}

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public String getCardId() { return cardId; }
    public void setCardId(String cardId) { this.cardId = cardId; }

    public static class OrderItemRequest {
        private String menuItemId;
        private int quantity;

        public OrderItemRequest() {}

        public String getMenuItemId() { return menuItemId; }
        public void setMenuItemId(String menuItemId) { this.menuItemId = menuItemId; }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}
