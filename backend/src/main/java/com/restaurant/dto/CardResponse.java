package com.restaurant.dto;

import com.restaurant.model.Card;

public class CardResponse {
    private String id;
    private String userId;
    private String maskedNumber;
    private String last4;
    private String holderName;
    private String expiryDate;
    private String brand;
    private double balance;

    public CardResponse() {}

    public static CardResponse from(Card card) {
        CardResponse r = new CardResponse();
        r.id = card.getId();
        r.userId = card.getUserId();
        r.holderName = card.getHolderName();
        r.expiryDate = card.getExpiryDate();
        r.brand = card.getBrand();
        r.balance = card.getBalance();

        String number = card.getCardNumber() != null ? card.getCardNumber() : "";
        if (number.length() >= 4) {
            r.last4 = number.substring(number.length() - 4);
            r.maskedNumber = "•••• •••• •••• " + r.last4;
        } else {
            r.last4 = "----";
            r.maskedNumber = "•••• •••• •••• ----";
        }
        return r;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getMaskedNumber() { return maskedNumber; }
    public void setMaskedNumber(String maskedNumber) { this.maskedNumber = maskedNumber; }

    public String getLast4() { return last4; }
    public void setLast4(String last4) { this.last4 = last4; }

    public String getHolderName() { return holderName; }
    public void setHolderName(String holderName) { this.holderName = holderName; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public double getBalance() { return balance; }
    public void setBalance(double balance) { this.balance = balance; }
}
