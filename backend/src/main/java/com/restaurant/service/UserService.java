package com.restaurant.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.restaurant.enums.Role;
import com.restaurant.model.User;
import com.restaurant.repository.RefreshTokenRepository;
import com.restaurant.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public UserService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateRole(String userId, Role newRole, String currentUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

        if (userId.equals(currentUserId)) {
            throw new IllegalArgumentException("Нельзя менять роль самому себе");
        }

        if (user.getRole() == Role.ADMIN && newRole != Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new IllegalArgumentException("Нельзя понизить последнего администратора");
            }
        }

        user.setRole(newRole);
        User saved = userRepository.save(user);

        try {
            refreshTokenRepository.deleteByUserId(userId);
        } catch (Exception ignored) {

        }

        return saved;
    }

    public void deleteUser(String userId, String currentUserId) {
        if (userId.equals(currentUserId)) {
            throw new IllegalArgumentException("Нельзя удалить самого себя");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new IllegalArgumentException("Нельзя удалить последнего администратора");
            }
        }

        try {
            refreshTokenRepository.deleteByUserId(userId);
        } catch (Exception ignored) {}

        userRepository.deleteById(userId);
    }
}
