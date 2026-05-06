package com.restaurant.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.restaurant.dto.AuthRequest;
import com.restaurant.dto.AuthResponse;
import com.restaurant.enums.Role;
import com.restaurant.model.RefreshToken;
import com.restaurant.model.User;
import com.restaurant.repository.RefreshTokenRepository;
import com.restaurant.repository.UserRepository;

@Service
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;
    private static final String GENERIC_AUTH_ERROR = "Неверный email или пароль";
    private static final Pattern NAME_HAS_DIGITS = Pattern.compile(".*\\d.*");

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public AuthResponse register(AuthRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email обязателен");
        }
        if (req.getName() == null || req.getName().isBlank()) {
            throw new IllegalArgumentException("Имя обязательно");
        }
        if (req.getPassword() == null || req.getPassword().length() < 8) {
            throw new IllegalArgumentException("Пароль должен быть не менее 8 символов");
        }

        String name = req.getName().trim();
        if (NAME_HAS_DIGITS.matcher(name).matches()) {
            throw new IllegalArgumentException("Имя не должно содержать цифр");
        }
        if (name.length() > 40) {
            throw new IllegalArgumentException("Имя слишком длинное (максимум 40 символов)");
        }

        String email = req.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Регистрация не удалась. Проверьте введённые данные");
        }

        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(Role.USER);
        user = userRepository.save(user);

        return issueTokens(user);
    }

    public AuthResponse login(AuthRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            throw new IllegalArgumentException(GENERIC_AUTH_ERROR);
        }

        String email = req.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException(GENERIC_AUTH_ERROR);
        }

        User user = userOpt.get();

        if (user.isLocked()) {
            long minutesLeft = ChronoUnit.MINUTES.between(Instant.now(), user.getLockedUntil()) + 1;
            throw new IllegalArgumentException(
                "Аккаунт временно заблокирован после нескольких неудачных попыток. " +
                "Попробуйте через " + minutesLeft + " мин."
            );
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            registerFailedAttempt(user);
            throw new IllegalArgumentException(GENERIC_AUTH_ERROR);
        }

        if (user.getFailedLoginAttempts() > 0) {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);
        }

        return issueTokens(user);
    }

    public AuthResponse refresh(String refreshTokenString) {
        if (refreshTokenString == null || refreshTokenString.isBlank()) {
            throw new IllegalArgumentException("Refresh token обязателен");
        }

        RefreshToken stored = refreshTokenRepository.findByToken(refreshTokenString)
                .orElseThrow(() -> new IllegalArgumentException("Недействительный refresh token"));

        if (!stored.isValid()) {
            throw new IllegalArgumentException("Refresh token просрочен или отозван");
        }

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return issueTokens(user);
    }

    public void logout(String refreshTokenString) {
        if (refreshTokenString == null || refreshTokenString.isBlank()) return;
        refreshTokenRepository.findByToken(refreshTokenString).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(jwtService.generateRefreshTokenString());
        refreshToken.setUserId(user.getId());
        refreshToken.setExpiresAt(jwtService.getRefreshExpiration());
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    private void registerFailedAttempt(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(Instant.now().plus(LOCK_DURATION_MINUTES, ChronoUnit.MINUTES));
            user.setFailedLoginAttempts(0);
        }
        userRepository.save(user);
    }
}
