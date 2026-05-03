package com.restaurant.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.restaurant.dto.AuthRequest;
import com.restaurant.dto.AuthResponse;
import com.restaurant.enums.Role;
import com.restaurant.model.User;
import com.restaurant.repository.UserRepository;

@Service
public class AuthService {

    private static final String ADMIN_EMAIL = "admin@gmail.com";

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public AuthResponse register(AuthRequest request) {
        validate(request, true);

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email уже зарегистрирован");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(email.equalsIgnoreCase(ADMIN_EMAIL) ? Role.ADMIN.name() : Role.USER.name());

        User saved = userRepository.save(user);

        String token = jwtService.generateToken(saved.getEmail(), saved.getRole());

        return new AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole());
    }

    public AuthResponse login(AuthRequest request) {
        validate(request, false);

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Неверный пароль");
        }

        String role = email.equalsIgnoreCase(ADMIN_EMAIL) ? Role.ADMIN.name() : user.getRole();
        if (!role.equals(user.getRole())) {
            user.setRole(role);
            userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getEmail(), role);

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), role);
    }

    private void validate(AuthRequest request, boolean requireName) {
        if (request == null) {
            throw new IllegalArgumentException("Тело запроса пустое");
        }
        if (requireName && (request.getName() == null || request.getName().trim().isEmpty())) {
            throw new IllegalArgumentException("Введите имя");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Введите email");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Введите пароль");
        }
    }
}
