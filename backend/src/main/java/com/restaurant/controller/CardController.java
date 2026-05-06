package com.restaurant.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.dto.CardCreateRequest;
import com.restaurant.dto.CardResponse;
import com.restaurant.service.CardService;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping("/user/{userId}")
    public List<CardResponse> getUserCards(@PathVariable String userId) {
        return cardService.getCardsForUser(userId).stream()
                .map(CardResponse::from)
                .toList();
    }

    @PostMapping
    public CardResponse createCard(@RequestBody CardCreateRequest request) {
        return CardResponse.from(cardService.createCard(request));
    }

    @DeleteMapping("/{cardId}")
    public Map<String, Object> deleteCard(@PathVariable String cardId,
                                          @RequestParam String userId) {
        cardService.deleteCard(cardId, userId);
        return Map.of("deleted", true, "id", cardId);
    }
}
