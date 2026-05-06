package com.restaurant.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.dto.UserResponse;
import com.restaurant.enums.Role;
import com.restaurant.service.UserService;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> getAll() {
        return userService.getAllUsers().stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    @PatchMapping("/{userId}/role")
    public UserResponse updateRole(@PathVariable String userId,
                                    @RequestParam String role) {
        Role newRole;
        try {
            newRole = Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Неизвестная роль: " + role);
        }

        String currentUserId = extractCurrentUserId();
        return UserResponse.from(userService.updateRole(userId, newRole, currentUserId));
    }

    @DeleteMapping("/{userId}")
    public void deleteUser(@PathVariable String userId) {
        String currentUserId = extractCurrentUserId();
        userService.deleteUser(userId, currentUserId);
    }

    private String extractCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalStateException("Пользователь не авторизован");
        }
        return (String) auth.getPrincipal();
    }
}
