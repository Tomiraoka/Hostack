package com.restaurant.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.restaurant.model.Ingredient;
import com.restaurant.model.InventoryItem;
import com.restaurant.model.MenuItem;
import com.restaurant.repository.InventoryRepository;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public List<InventoryItem> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public InventoryItem addInventoryItem(InventoryItem item) {
        if (item.getName() == null || item.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Имя продукта обязательно");
        }
        return inventoryRepository.save(item);
    }

    public InventoryItem updateInventoryItem(String id, InventoryItem updated) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Продукт не найден"));

        if (updated.getName() != null) item.setName(updated.getName());
        if (updated.getCategory() != null) item.setCategory(updated.getCategory());
        item.setQuantity(updated.getQuantity());
        if (updated.getUnit() != null) item.setUnit(updated.getUnit());
        item.setMinQuantity(updated.getMinQuantity());

        return inventoryRepository.save(item);
    }

    public void deleteInventoryItem(String id) {
        if (!inventoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Продукт не найден");
        }
        inventoryRepository.deleteById(id);
    }

    public boolean isMenuItemAvailable(MenuItem menuItem) {
        if (menuItem.getIngredients() == null || menuItem.getIngredients().isEmpty()) {
            return true;
        }

        for (Ingredient ingredient : menuItem.getIngredients()) {
            InventoryItem stock = inventoryRepository.findByName(ingredient.getName()).orElse(null);
            if (stock == null) return false;
            if (stock.getQuantity() < ingredient.getAmount()) return false;
        }
        return true;
    }

    public Map<String, Double> calculateNeededProducts(Map<MenuItem, Integer> menuItemsWithQty) {
        Map<String, Double> needed = new HashMap<>();
        for (Map.Entry<MenuItem, Integer> entry : menuItemsWithQty.entrySet()) {
            MenuItem item = entry.getKey();
            int qty = entry.getValue();
            if (item.getIngredients() == null) continue;
            for (Ingredient ing : item.getIngredients()) {
                needed.merge(ing.getName(), ing.getAmount() * qty, Double::sum);
            }
        }
        return needed;
    }

    public void ensureInventoryAvailable(Map<MenuItem, Integer> menuItemsWithQty) {
        Map<String, Double> needed = calculateNeededProducts(menuItemsWithQty);

        for (Map.Entry<String, Double> e : needed.entrySet()) {
            String productName = e.getKey();
            double neededAmount = e.getValue();

            InventoryItem stock = inventoryRepository.findByName(productName)
                    .orElseThrow(() -> new IllegalStateException(
                            "Продукт отсутствует на складе: " + productName));

            if (stock.getQuantity() < neededAmount) {
                throw new IllegalStateException(
                        "Не хватает продукта: " + productName +
                        " (нужно " + neededAmount + " " + stock.getUnit() +
                        ", в наличии " + stock.getQuantity() + " " + stock.getUnit() + ")");
            }
        }
    }

    public void reduceInventory(Map<MenuItem, Integer> menuItemsWithQty) {
        Map<String, Double> needed = calculateNeededProducts(menuItemsWithQty);

        for (Map.Entry<String, Double> e : needed.entrySet()) {
            InventoryItem stock = inventoryRepository.findByName(e.getKey())
                    .orElseThrow(() -> new IllegalStateException("Продукт не найден: " + e.getKey()));
            stock.setQuantity(stock.getQuantity() - e.getValue());
            inventoryRepository.save(stock);
        }
    }
}
