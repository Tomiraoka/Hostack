package com.restaurant.service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.restaurant.dto.MenuItemResponse;
import com.restaurant.model.MenuItem;
import com.restaurant.model.Order;
import com.restaurant.model.OrderLine;
import com.restaurant.repository.MenuRepository;
import com.restaurant.repository.OrderRepository;

@Service
public class MenuService {

    private final MenuRepository menuRepository;
    private final InventoryService inventoryService;
    private final OrderRepository orderRepository;

    public MenuService(MenuRepository menuRepository,
                       InventoryService inventoryService,
                       OrderRepository orderRepository) {
        this.menuRepository = menuRepository;
        this.inventoryService = inventoryService;
        this.orderRepository = orderRepository;
    }

    public List<MenuItemResponse> getAllMenuItems() {
        return menuRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<MenuItemResponse> getPopularForUser(String userId, int limit) {
        if (userId == null || userId.isBlank()) {
            return List.of();
        }
        List<Order> userOrders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (userOrders.isEmpty()) return List.of();

        Map<String, Integer> menuItemCounts = new HashMap<>();
        for (Order order : userOrders) {
            if (order.getItems() == null) continue;
            for (OrderLine line : order.getItems()) {
                if (line.getMenuItemId() == null) continue;
                menuItemCounts.merge(line.getMenuItemId(), line.getQuantity(), Integer::sum);
            }
        }

        return menuItemCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> menuRepository.findById(entry.getKey()).orElse(null))
                .filter(item -> item != null)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private MenuItemResponse toResponse(MenuItem item) {
        return new MenuItemResponse(
                item.getId(),
                item.getName(),
                item.getCategory(),
                item.getDescription(),
                item.getPrice(),
                item.getOldPrice(),
                item.getSize(),
                item.getImage(),
                item.getBadge(),
                item.isDiscount(),
                inventoryService.isMenuItemAvailable(item),
                item.getPreparationTime(),
                item.getIngredients()
        );
    }

    public MenuItem addMenuItem(MenuItem menuItem) {
        if (menuItem.getName() == null || menuItem.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Название блюда обязательно");
        }
        return menuRepository.save(menuItem);
    }

    public MenuItem updateMenuItem(String id, MenuItem updated) {
        MenuItem item = menuRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Блюдо не найдено"));

        if (updated.getName() != null) item.setName(updated.getName());
        if (updated.getCategory() != null) item.setCategory(updated.getCategory());
        if (updated.getDescription() != null) item.setDescription(updated.getDescription());
        item.setPrice(updated.getPrice());
        item.setOldPrice(updated.getOldPrice());
        if (updated.getSize() != null) item.setSize(updated.getSize());
        if (updated.getImage() != null) item.setImage(updated.getImage());
        item.setBadge(updated.getBadge());
        item.setDiscount(updated.isDiscount());
        item.setPreparationTime(updated.getPreparationTime());
        if (updated.getIngredients() != null) item.setIngredients(updated.getIngredients());

        return menuRepository.save(item);
    }

    public void deleteMenuItem(String id) {
        if (!menuRepository.existsById(id)) {
            throw new IllegalArgumentException("Блюдо не найдено");
        }
        menuRepository.deleteById(id);
    }

    public MenuItem getMenuItemById(String id) {
        return menuRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Блюдо не найдено: " + id));
    }
}
