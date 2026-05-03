package com.restaurant.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.restaurant.dto.CardCreateRequest;
import com.restaurant.model.Card;
import com.restaurant.repository.CardRepository;
import com.restaurant.repository.UserRepository;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final UserRepository userRepository;

    @Value("${restaurant.card.min-balance:50000}")
    private double minBalance;

    @Value("${restaurant.card.max-balance:500000}")
    private double maxBalance;

    public CardService(CardRepository cardRepository, UserRepository userRepository) {
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
    }

    public List<Card> getCardsForUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("Не указан пользователь");
        }
        return cardRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Card createCard(CardCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Не переданы данные карты");
        }
        String userId = request.getUserId();
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("Не указан пользователь");
        }
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("Пользователь не найден");
        }

        String holder = (request.getHolderName() == null) ? "" : request.getHolderName().trim();
        if (holder.isEmpty()) {
            throw new IllegalArgumentException("Укажите имя владельца карты");
        }
        if (holder.length() > 40) {
            throw new IllegalArgumentException("Имя владельца слишком длинное");
        }

        String cardNumber = normalizeCardNumber(request.getCardNumber());
        if (cardNumber.length() != 16) {
            throw new IllegalArgumentException("Номер карты должен содержать 16 цифр");
        }
        if (!cardNumber.chars().allMatch(Character::isDigit)) {
            throw new IllegalArgumentException("Номер карты должен содержать только цифры");
        }

        String expiry = normalizeExpiry(request.getExpiryDate());
        validateExpiryNotPassed(expiry);

        String cvc = (request.getCvc() == null) ? "" : request.getCvc().trim();
        if (!cvc.matches("\\d{3,4}")) {
            throw new IllegalArgumentException("CVC должен содержать 3 или 4 цифры");
        }

        Card card = new Card();
        card.setUserId(userId);
        card.setHolderName(holder.toUpperCase());
        card.setCardNumber(cardNumber);
        card.setExpiryDate(expiry);
        card.setBrand(detectBrand(cardNumber));
        card.setBalance(randomBalance());

        return cardRepository.save(card);
    }

    public void deleteCard(String cardId, String userId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Карта не найдена"));
        ensureOwner(card, userId);
        cardRepository.delete(card);
    }

    public Card requireOwnedCard(String cardId, String userId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Карта не найдена"));
        ensureOwner(card, userId);
        return card;
    }

    public Card chargeCard(Card card, double amount) {
        if (card.getBalance() < amount) {
            throw new IllegalArgumentException(String.format(
                    "Недостаточно средств. Доступно: %.0f₸, требуется: %.0f₸",
                    card.getBalance(), amount));
        }
        card.setBalance(card.getBalance() - amount);
        return cardRepository.save(card);
    }

    private void ensureOwner(Card card, String userId) {
        if (userId == null || !userId.equals(card.getUserId())) {
            throw new IllegalArgumentException("Эта карта вам не принадлежит");
        }
    }

    private String normalizeCardNumber(String raw) {
        if (raw == null) return "";
        return raw.replaceAll("\\s+", "").trim();
    }

    private String normalizeExpiry(String raw) {
        if (raw == null) {
            throw new IllegalArgumentException("Укажите срок действия карты");
        }
        String value = raw.trim();
        if (!value.matches("\\d{2}/\\d{2}")) {
            throw new IllegalArgumentException("Срок действия должен быть в формате ММ/ГГ");
        }
        int month = Integer.parseInt(value.substring(0, 2));
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Месяц должен быть от 01 до 12");
        }
        return value;
    }

    private void validateExpiryNotPassed(String expiry) {
        int month = Integer.parseInt(expiry.substring(0, 2));
        int year = 2000 + Integer.parseInt(expiry.substring(3, 5));
        YearMonth cardEnd = YearMonth.of(year, month);
        if (cardEnd.isBefore(YearMonth.from(LocalDate.now()))) {
            throw new IllegalArgumentException("Срок действия карты истёк");
        }
    }

    private String detectBrand(String cardNumber) {
        char first = cardNumber.charAt(0);
        if (first == '4') return "VISA";
        if (first == '5' || first == '2') return "MASTERCARD";
        if (first == '3') return "AMEX";
        return "CARD";
    }

    private double randomBalance() {
        double range = maxBalance - minBalance;
        double raw = minBalance + ThreadLocalRandom.current().nextDouble() * range;
        return Math.round(raw / 100.0) * 100.0;
    }
}
