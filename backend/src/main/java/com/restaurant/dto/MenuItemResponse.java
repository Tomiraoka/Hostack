package com.restaurant.dto;

import java.util.List;

import com.restaurant.model.Ingredient;

public class MenuItemResponse {

    private String id;
    private String name;
    private String category;
    private String description;
    private double price;
    private double oldPrice;
    private String size;
    private String image;
    private String badge;
    private boolean discount;
    private boolean available;
    private int preparationTime;
    private List<Ingredient> ingredients;

    public MenuItemResponse() {}

    public MenuItemResponse(
            String id, String name, String category, String description,
            double price, double oldPrice, String size, String image,
            String badge, boolean discount, boolean available,
            int preparationTime, List<Ingredient> ingredients) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.price = price;
        this.oldPrice = oldPrice;
        this.size = size;
        this.image = image;
        this.badge = badge;
        this.discount = discount;
        this.available = available;
        this.preparationTime = preparationTime;
        this.ingredients = ingredients;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public double getPrice() { return price; }
    public double getOldPrice() { return oldPrice; }
    public String getSize() { return size; }
    public String getImage() { return image; }
    public String getBadge() { return badge; }
    public boolean isDiscount() { return discount; }
    public boolean isAvailable() { return available; }
    public int getPreparationTime() { return preparationTime; }
    public List<Ingredient> getIngredients() { return ingredients; }
}
