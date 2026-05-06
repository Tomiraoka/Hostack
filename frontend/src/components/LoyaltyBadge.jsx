import Icon from "./Icon";
import "./LoyaltyBadge.css";

const TIER_CONFIG = {
  NEWCOMER: { iconName: "user",   className: "tier-newcomer" },
  BRONZE:   { iconName: "reward", className: "tier-bronze" },
  SILVER:   { iconName: "reward", className: "tier-silver" },
  GOLD:     { iconName: "reward", className: "tier-gold" }
};

export default function LoyaltyBadge({ loyalty, compact = false }) {
  if (!loyalty) return null;
  const config = TIER_CONFIG[loyalty.tier] || TIER_CONFIG.NEWCOMER;

  const total = loyalty.ordersCount + (loyalty.ordersToNextTier || 0);
  const progressPct = total > 0 ? Math.min(100, (loyalty.ordersCount / total) * 100) : 100;

  if (compact) {
    return (
      <span className={`loyalty-pill ${config.className}`}>
        <Icon name={config.iconName} size={14} />
        {loyalty.tierName}
        {loyalty.discountPercent > 0 && <strong> · −{loyalty.discountPercent}%</strong>}
      </span>
    );
  }

  return (
    <div className={`loyalty-card ${config.className}`}>
      <div className="loyalty-card-head">
        <div className="loyalty-icon">
          <Icon name={config.iconName} size={28} />
        </div>
        <div className="loyalty-titles">
          <strong>{loyalty.tierName}</strong>
          <small>
            {loyalty.discountPercent > 0
              ? `Ваша скидка на каждый заказ — ${loyalty.discountPercent}%`
              : "Сделайте первые заказы, чтобы получить скидку"}
          </small>
        </div>
      </div>

      <div className="loyalty-stats">
        <div>
          <span>Всего заказов</span>
          <strong>{loyalty.ordersCount}</strong>
        </div>
        <div>
          <span>Потрачено всего</span>
          <strong>{Math.round(loyalty.totalSpent || 0).toLocaleString("ru-RU")} ₸</strong>
        </div>
      </div>

      {loyalty.nextTier && (
        <div className="loyalty-progress">
          <div className="loyalty-progress-text">
            <span>До «{loyalty.nextTierName}»</span>
            <strong>
              ещё {loyalty.ordersToNextTier} заказ{getOrdersWord(loyalty.ordersToNextTier)} → −{loyalty.nextTierDiscount}%
            </strong>
          </div>
          <div className="loyalty-progress-bar">
            <div
              className="loyalty-progress-fill"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>
      )}

      {!loyalty.nextTier && (
        <div className="loyalty-max">
          <Icon name="star" size={16} className="icon-inline" />
          Вы достигли максимального тира
        </div>
      )}
    </div>
  );
}

function getOrdersWord(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return "ов";
  if (mod10 === 1) return "";
  if (mod10 >= 2 && mod10 <= 4) return "а";
  return "ов";
}
