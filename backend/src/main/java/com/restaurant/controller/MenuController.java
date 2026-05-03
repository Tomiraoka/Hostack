package com.restaurant.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.dto.MenuItemResponse;
import com.restaurant.model.MenuItem;
import com.restaurant.service.MenuService;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    public List<MenuItemResponse> getMenu() {
        return menuService.getAllMenuItems();
    }

    @PostMapping
    public MenuItem addMenuItem(@RequestBody MenuItem menuItem) {
        return menuService.addMenuItem(menuItem);
    }

    @PutMapping("/{id}")
    public MenuItem updateMenuItem(@PathVariable String id, @RequestBody MenuItem menuItem) {
        return menuService.updateMenuItem(id, menuItem);
    }

    @DeleteMapping("/{id}")
    public void deleteMenuItem(@PathVariable String id) {
        menuService.deleteMenuItem(id);
    }
}
