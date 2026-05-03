import { useState } from "react";

import Icon from "./Icon";
import "./AddCardModal.css";

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return digits.slice(0, 2) + "/" + digits.slice(2);
}

function detectBrand(numberDigits) {
  const first = numberDigits.charAt(0);
  if (first === "4") return "VISA";
  if (first === "5" || first === "2") return "MASTERCARD";
  if (first === "3") return "AMEX";
  return "CARD";
}

export default function AddCardModal({ onClose, onSubmit, submitting }) {
  const [holderName, setHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState({});

  const numberDigits = cardNumber.replace(/\D/g, "");
  const brand = numberDigits.length >= 1 ? detectBrand(numberDigits) : "CARD";
  const last4 = numberDigits.length >= 4 ? numberDigits.slice(-4) : "••••";

  function validate() {
    const next = {};

    if (!holderName.trim()) next.holderName = "Введите имя владельца";
    else if (holderName.trim().length < 2) next.holderName = "Слишком короткое имя";

    if (numberDigits.length !== 16) next.cardNumber = "Номер должен содержать 16 цифр";

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      next.expiryDate = "Формат: ММ/ГГ";
    } else {
      const month = parseInt(expiryDate.slice(0, 2), 10);
      if (month < 1 || month > 12) next.expiryDate = "Месяц от 01 до 12";
      else {
        const year = 2000 + parseInt(expiryDate.slice(3, 5), 10);
        const today = new Date();
        const cardEnd = new Date(year, month, 0);
        if (cardEnd < today) next.expiryDate = "Срок действия истёк";
      }
    }

    if (!/^\d{3,4}$/.test(cvc)) next.cvc = "3 или 4 цифры";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      holderName: holderName.trim(),
      cardNumber: numberDigits,
      expiryDate,
      cvc
    });
  }

  return (
    <div className="add-card-overlay" onClick={onClose}>
      <div className="add-card-modal" onClick={(e) => e.stopPropagation()}>
        <button className="add-card-close" onClick={onClose} aria-label="Закрыть">
          <Icon name="close" size={18} />
        </button>

        <h2>Новая карта</h2>
        <p className="add-card-subtitle">
          Введите данные вашей карты. Это симуляция — реальные деньги не списываются.
        </p>

        <div className={`add-card-preview brand-${brand.toLowerCase()}`}>
          <div className="preview-brand">{brand}</div>
          <div className="preview-chip"></div>
          <div className="preview-number">
            {numberDigits.padEnd(16, "•").match(/.{1,4}/g).join(" ")}
          </div>
          <div className="preview-row">
            <div>
              <small>Владелец</small>
              <strong>{holderName.toUpperCase() || "ВАШЕ ИМЯ"}</strong>
            </div>
            <div>
              <small>Срок</small>
              <strong>{expiryDate || "ММ/ГГ"}</strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label>
            Имя владельца
            <input
              type="text"
              className={errors.holderName ? "input-error" : ""}
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="IVAN PETROV"
              maxLength={40}
              autoComplete="cc-name"
              autoFocus
            />
            {errors.holderName && <small>{errors.holderName}</small>}
          </label>

          <label>
            Номер карты
            <input
              type="text"
              inputMode="numeric"
              className={errors.cardNumber ? "input-error" : ""}
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              autoComplete="cc-number"
            />
            {errors.cardNumber && <small>{errors.cardNumber}</small>}
          </label>

          <div className="add-card-row">
            <label>
              Срок действия
              <input
                type="text"
                inputMode="numeric"
                className={errors.expiryDate ? "input-error" : ""}
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                placeholder="ММ/ГГ"
                autoComplete="cc-exp"
              />
              {errors.expiryDate && <small>{errors.expiryDate}</small>}
            </label>

            <label>
              CVC
              <input
                type="text"
                inputMode="numeric"
                className={errors.cvc ? "input-error" : ""}
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="000"
                autoComplete="cc-csc"
                maxLength={4}
              />
              {errors.cvc && <small>{errors.cvc}</small>}
            </label>
          </div>

          <div className="add-card-actions">
            <button type="button" className="secondary-btn" onClick={onClose} disabled={submitting}>
              Отмена
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Добавляем..." : "Добавить карту"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
