import "./CardView.css";

export default function CardView({ card, onDelete, selectable, selected, onSelect, disabled }) {
  const brandClass = card.brand === "VISA" ? "brand-visa" : "brand-mc";

  function handleClick() {
    if (selectable && !disabled && onSelect) onSelect(card);
  }

  return (
    <div
      className={`bank-card ${brandClass} ${selectable ? "is-selectable" : ""} ${
        selected ? "is-selected" : ""
      } ${disabled ? "is-disabled" : ""}`}
      onClick={handleClick}
      role={selectable ? "button" : undefined}
    >
      <div className="bank-card-top">
        <span className="bank-card-chip">▮▮▮</span>
        <span className="bank-card-brand">{card.brand}</span>
      </div>

      <div className="bank-card-number">{card.maskedNumber}</div>

      <div className="bank-card-bottom">
        <div className="bank-card-holder">
          <small>Владелец</small>
          <strong>{card.holderName}</strong>
        </div>
        <div className="bank-card-expiry">
          <small>Действительна до</small>
          <strong>{card.expiryDate}</strong>
        </div>
      </div>

      <div className="bank-card-balance-row">
        <span>Баланс</span>
        <strong>{card.balance.toLocaleString("ru-RU")} ₸</strong>
      </div>

      {onDelete && (
        <button
          className="bank-card-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card);
          }}
          title="Удалить карту"
        >
          ✕
        </button>
      )}

      {selected && <div className="bank-card-selected-mark">✓</div>}
    </div>
  );
}
