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

import com.restaurant.model.InventoryItem;
import com.restaurant.service.InventoryService;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<InventoryItem> getInventory() {
        return inventoryService.getAllInventory();
    }

    @PostMapping
    public InventoryItem addInventoryItem(@RequestBody InventoryItem item) {
        return inventoryService.addInventoryItem(item);
    }

    @PutMapping("/{id}")
    public InventoryItem updateInventoryItem(@PathVariable String id, @RequestBody InventoryItem item) {
        return inventoryService.updateInventoryItem(id, item);
    }

    @DeleteMapping("/{id}")
    public void deleteInventoryItem(@PathVariable String id) {
        inventoryService.deleteInventoryItem(id);
    }
}
