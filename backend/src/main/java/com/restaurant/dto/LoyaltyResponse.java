package com.restaurant.dto;

public class LoyaltyResponse {

    private String tier;
    private String tierName;
    private int discountPercent;

    private int ordersCount;
    private double totalSpent;

    private String nextTier;
    private String nextTierName;
    private int nextTierDiscount;
    private int ordersToNextTier;

    public LoyaltyResponse() {}

    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }

    public String getTierName() { return tierName; }
    public void setTierName(String tierName) { this.tierName = tierName; }

    public int getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(int discountPercent) { this.discountPercent = discountPercent; }

    public int getOrdersCount() { return ordersCount; }
    public void setOrdersCount(int ordersCount) { this.ordersCount = ordersCount; }

    public double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(double totalSpent) { this.totalSpent = totalSpent; }

    public String getNextTier() { return nextTier; }
    public void setNextTier(String nextTier) { this.nextTier = nextTier; }

    public String getNextTierName() { return nextTierName; }
    public void setNextTierName(String nextTierName) { this.nextTierName = nextTierName; }

    public int getNextTierDiscount() { return nextTierDiscount; }
    public void setNextTierDiscount(int nextTierDiscount) { this.nextTierDiscount = nextTierDiscount; }

    public int getOrdersToNextTier() { return ordersToNextTier; }
    public void setOrdersToNextTier(int ordersToNextTier) { this.ordersToNextTier = ordersToNextTier; }
}
