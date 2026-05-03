package com.restaurant.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.restaurant.dto.MenuItemResponse;
import com.restaurant.model.MenuItem;
import com.restaurant.repository.MenuRepository;

@Service
public class MenuService {

    private final MenuRepository menuRepository;
    private final InventoryService inventoryService;

    public MenuService(MenuRepository menuRepository, InventoryService inventoryService) {
        this.menuRepository = menuRepository;
        this.inventoryService = inventoryService;
    }

    public List<MenuItemResponse> getAllMenuItems() {
        return menuRepository.findAll().stream()
                .map(item -> new MenuItemResponse(
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
                ))
                .collect(Collectors.toList());
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
