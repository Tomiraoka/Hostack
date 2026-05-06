package com.restaurant.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "menu_items")
public class MenuItem {

    @Id
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

    private int preparationTime;

    private List<Ingredient> ingredients = new ArrayList<>();

    public MenuItem() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public double getOldPrice() { return oldPrice; }
    public void setOldPrice(double oldPrice) { this.oldPrice = oldPrice; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public boolean isDiscount() { return discount; }
    public void setDiscount(boolean discount) { this.discount = discount; }

    public int getPreparationTime() { return preparationTime; }
    public void setPreparationTime(int preparationTime) { this.preparationTime = preparationTime; }

    public List<Ingredient> getIngredients() { return ingredients; }
    public void setIngredients(List<Ingredient> ingredients) {
        this.ingredients = (ingredients != null) ? ingredients : new ArrayList<>();
    }
}
