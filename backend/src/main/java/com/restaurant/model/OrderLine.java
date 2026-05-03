package com.restaurant.model;

import java.time.Instant;

public class OrderLine {

    private String menuItemId;
    private String name;
    private double price;
    private int quantity;

    private int prepTime;
    private Instant startsAt;

    public OrderLine() {}

    public OrderLine(String menuItemId, String name, double price, int quantity, int prepTime) {
        this.menuItemId = menuItemId;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.prepTime = prepTime;
    }

    public String getMenuItemId() { return menuItemId; }
    public void setMenuItemId(String menuItemId) { this.menuItemId = menuItemId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public int getPrepTime() { return prepTime; }
    public void setPrepTime(int prepTime) { this.prepTime = prepTime; }

    public Instant getStartsAt() { return startsAt; }
    public void setStartsAt(Instant startsAt) { this.startsAt = startsAt; }

    public double getSubtotal() {
        return price * quantity;
    }
}
