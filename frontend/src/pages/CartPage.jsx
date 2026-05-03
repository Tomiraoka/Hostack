import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Footer from "../components/Footer";
import Icon from "../components/Icon";
import LoyaltyBadge from "../components/LoyaltyBadge";
import { cardApi } from "../api/cardApi";
import { loyaltyApi } from "../api/loyaltyApi";
import { orderApi } from "../api/orderApi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import "./CartPage.css";

function CartPage() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const toast = useToast();
  const { items, totalItems, totalPrice, increaseQuantity, decreaseQuantity, removeItem, clearCart } = useCart();

  const [orderType, setOrderType] = useState("PICKUP");
  const [address, setAddress] = useState("");

  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [selectedCardId, setSelectedCardId] = useState(null);

  const [loyalty, setLoyalty] = useState(null);

  const [paying, setPaying] = useState(false);
  const [payingPhase, setPayingPhase] = useState("processing");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCards();
    loadLoyalty();

  }, []);

  async function loadCards() {
    try {
      const data = await cardApi.getByUser(auth.userId);
      setCards(data);

      if (data.length > 0) {
        setPaymentMethod("CARD");
        setSelectedCardId(data[0].id);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingCards(false);
    }
  }

  async function loadLoyalty() {
    try {
      const data = await loyaltyApi.getForUser(auth.userId);
      setLoyalty(data);
    } catch (err) {
      console.warn("loyalty load failed", err.message);
    }
  }

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedCardId) || null,
    [cards, selectedCardId]
  );

  const discountPercent = loyalty?.discountPercent || 0;
  const discountAmount = Math.round((totalPrice * discountPercent) / 100);
  const finalPrice = totalPrice - discountAmount;

  const insufficientFunds =
    paymentMethod === "CARD" && selectedCard && selectedCard.balance < finalPrice;

  async function placeOrder() {
    if (items.length === 0) return;

    if (orderType === "DELIVERY" && !address.trim()) {
      toast.error("Укажите адрес доставки");
      return;
    }
    if (paymentMethod === "CARD" && !selectedCardId) {
      toast.error("Выберите карту для оплаты");
      return;
    }
    if (insufficientFunds) {
      toast.error("Недостаточно средств на выбранной карте");
      return;
    }

    const order = {
      userId: auth.userId,
      items: items.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
      type: orderType,
      deliveryAddress: orderType === "DELIVERY" ? address.trim() : null,
      cardId: paymentMethod === "CARD" ? selectedCardId : null
    };

    if (paymentMethod === "CARD") {

      setPaying(true);
      setPayingPhase("processing");
    } else {
      setSubmitting(true);
    }

    try {

      const [] = await Promise.all([
        orderApi.create(order),
        paymentMethod === "CARD"
          ? new Promise((r) => setTimeout(r, 1400))
          : Promise.resolve()
      ]);

      if (paymentMethod === "CARD") {
        setPayingPhase("success");
        await new Promise((r) => setTimeout(r, 1100));
      }

      clearCart();
      toast.success(
        orderType === "DELIVERY"
          ? "Заказ оформлен! Курьер уже в работе"
          : "Заказ оформлен! Можно забирать вскоре"
      );
      navigate("/orders");
    } catch (err) {
      toast.error(err.message);
      setPaying(false);
      setSubmitting(false);
    }
  }

  return (
    <>
      <main className="cart-page">
        <section className="cart-header">
          <h1>Ваша корзина</h1>
          <p>Товаров в корзине: {totalItems}</p>
        </section>

        {items.length === 0 ? (
          <div className="empty-cart">
            <h2>Корзина пустая</h2>
            <p>Добавьте блюда из меню, чтобы оформить заказ</p>
            <Link to="/menu" className="empty-cart-btn">Перейти в меню</Link>
          </div>
        ) : (
          <section className="cart-layout">
            <div className="cart-list">
              {items.map((item) => (
                <div className="cart-item-card" key={item.id}>
                  <img src={item.image} alt={item.name} />

                  <div className="cart-info">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <span>{item.price}₸</span>
                  </div>

                  <div className="cart-actions">
                    <div className="quantity-box">
                      <button onClick={() => decreaseQuantity(item.id)} aria-label="Меньше">−</button>
                      <strong>{item.quantity}</strong>
                      <button onClick={() => increaseQuantity(item.id)} aria-label="Больше">+</button>
                    </div>

                    <button className="delete-btn" onClick={() => removeItem(item.id)} aria-label="Удалить">
                      <Icon name="trash" size={18} />
                    </button>
                  </div>

                  <strong className="cart-price">{item.price * item.quantity}₸</strong>
                </div>
              ))}
            </div>

            <aside className="cart-summary">
              <h2>Итого</h2>

              <div className="summary-row">
                <span>Товары ({totalItems})</span>
                <strong>{totalPrice.toLocaleString("ru-RU")}₸</strong>
              </div>
              <div className="summary-row">
                <span>Доставка</span>
                <strong>{orderType === "DELIVERY" ? "Бесплатно" : "—"}</strong>
              </div>

              {discountPercent > 0 && (
                <>
                  <div className="summary-row discount-row">
                    <span>
                      <Icon name="gift" size={14} className="icon-inline" />
                      Скидка постоянного клиента
                      {loyalty && (
                        <small> ({loyalty.tierName}, −{discountPercent}%)</small>
                      )}
                    </span>
                    <strong>−{discountAmount.toLocaleString("ru-RU")}₸</strong>
                  </div>
                </>
              )}

              <div className="summary-line"></div>

              <div className="summary-total">
                <span>К оплате</span>
                <strong>{finalPrice.toLocaleString("ru-RU")}₸</strong>
              </div>

              {loyalty && discountPercent === 0 && loyalty.nextTier && (
                <div className="loyalty-cart-hint">
                  <Icon name="info" size={14} className="icon-inline" />
                  Ещё {loyalty.ordersToNextTier} заказ
                  {loyalty.ordersToNextTier === 1 ? "" : "а+"} — и получите скидку
                  {" −"}{loyalty.nextTierDiscount}%
                </div>
              )}

              <h3>Способ получения</h3>
              <button
                type="button"
                className={`delivery-card ${orderType === "PICKUP" ? "active" : ""}`}
                onClick={() => setOrderType("PICKUP")}
              >
                <span className="delivery-card-icon"><Icon name="pickup" size={20} /></span>
                <div>
                  <strong>Самовывоз из ресторана</strong>
                  <p>Астана, ул. Restaurant, 15</p>
                </div>
                {orderType === "PICKUP" && (
                  <div className="delivery-check"><Icon name="check" size={14} /></div>
                )}
              </button>

              <button
                type="button"
                className={`delivery-card ${orderType === "DELIVERY" ? "active" : ""}`}
                onClick={() => setOrderType("DELIVERY")}
              >
                <span className="delivery-card-icon"><Icon name="delivery" size={20} /></span>
                <div>
                  <strong>Доставка курьером</strong>
                  <p>Бесплатно · ~10 мин после готовности</p>
                </div>
                {orderType === "DELIVERY" && (
                  <div className="delivery-check"><Icon name="check" size={14} /></div>
                )}
              </button>

              {orderType === "DELIVERY" && (
                <div className="delivery-address">
                  <label>
                    Адрес доставки
                    <textarea
                      rows="2"
                      placeholder="Улица, дом, квартира, этаж..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </label>
                </div>
              )}

              <h3>Способ оплаты</h3>
              {loadingCards ? (
                <div className="payment-loading">Загружаем карты...</div>
              ) : (
                <>

                  {cards.length === 0 ? (
                    <div className="payment-no-cards">
                      <span className="delivery-card-icon"><Icon name="card" size={20} /></span>
                      <div>
                        <strong>Нет привязанных карт</strong>
                        <p>
                          Чтобы платить онлайн —{" "}
                          <Link to="/profile">добавьте карту в профиле</Link>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={`delivery-card ${paymentMethod === "CARD" ? "active" : ""}`}
                      onClick={() => setPaymentMethod("CARD")}
                    >
                      <span className="delivery-card-icon"><Icon name="card" size={20} /></span>
                      <div>
                        <strong>Картой онлайн</strong>
                        <p>{cards.length} карт{cards.length === 1 ? "а" : "ы"} доступн{cards.length === 1 ? "а" : "ы"}</p>
                      </div>
                      {paymentMethod === "CARD" && (
                        <div className="delivery-check"><Icon name="check" size={14} /></div>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    className={`delivery-card ${paymentMethod === "CASH" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("CASH")}
                  >
                    <span className="delivery-card-icon"><Icon name="cash" size={20} /></span>
                    <div>
                      <strong>При получении</strong>
                      <p>Наличные или картой курьеру</p>
                    </div>
                    {paymentMethod === "CASH" && (
                      <div className="delivery-check"><Icon name="check" size={14} /></div>
                    )}
                  </button>

                  {paymentMethod === "CARD" && cards.length > 0 && (
                    <div className="cards-picker">
                      {cards.map((card) => {
                        const isSelected = card.id === selectedCardId;
                        const isInsufficient = card.balance < finalPrice;
                        return (
                          <button
                            type="button"
                            key={card.id}
                            className={`card-row ${isSelected ? "selected" : ""} ${
                              isInsufficient ? "insufficient" : ""
                            }`}
                            onClick={() => setSelectedCardId(card.id)}
                            disabled={isInsufficient}
                          >
                            <div className={`card-row-brand brand-${card.brand.toLowerCase()}`}>
                              {card.brand === "VISA" ? "VISA" : "MC"}
                            </div>
                            <div className="card-row-info">
                              <strong>•••• {card.last4}</strong>
                              <small>
                                Баланс: {card.balance.toLocaleString("ru-RU")} ₸
                                {isInsufficient && (
                                  <span className="insufficient-tag"> · недостаточно</span>
                                )}
                              </small>
                            </div>
                            {isSelected && !isInsufficient && (
                              <div className="card-row-check"><Icon name="check" size={14} /></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {insufficientFunds && (
                <div className="server-error" style={{ marginTop: 12, marginBottom: 0 }}>
                  На карте недостаточно средств для этого заказа
                </div>
              )}

              <button
                className="checkout-btn"
                onClick={placeOrder}
                disabled={submitting || paying || insufficientFunds}
              >
                {submitting ? (
                  "Оформляем..."
                ) : paymentMethod === "CARD" ? (
                  <>
                    <Icon name="card" size={16} className="icon-inline" />
                    Оплатить {finalPrice.toLocaleString("ru-RU")}₸
                  </>
                ) : orderType === "DELIVERY" ? (
                  <>
                    <Icon name="delivery" size={16} className="icon-inline" />
                    Заказать с доставкой
                  </>
                ) : (
                  <>
                    <Icon name="pickup" size={16} className="icon-inline" />
                    Оформить самовывоз
                  </>
                )}
              </button>
            </aside>
          </section>
        )}
      </main>

      <Footer />

      {paying && (
        <PaymentOverlay
          phase={payingPhase}
          card={selectedCard}
          amount={finalPrice}
        />
      )}
    </>
  );
}

function PaymentOverlay({ phase, card, amount }) {
  return (
    <div className="payment-overlay">
      <div className="payment-modal">
        {phase === "processing" ? (
          <>
            <div className="payment-icon spinning">
              <Icon name="card" size={32} />
            </div>
            <h2>Списываем оплату</h2>
            {card && (
              <p>
                с карты <strong>•••• {card.last4}</strong> ({card.brand})
              </p>
            )}
            <div className="payment-amount">{amount.toLocaleString("ru-RU")} ₸</div>
            <div className="payment-progress-bar">
              <div className="payment-progress-fill"></div>
            </div>
            <small>Идёт обработка платежа...</small>
          </>
        ) : (
          <>
            <div className="payment-icon success">
              <Icon name="check" size={36} />
            </div>
            <h2>Оплачено</h2>
            {card && (
              <p>
                Списано с карты <strong>•••• {card.last4}</strong>
              </p>
            )}
            <div className="payment-amount success">{amount.toLocaleString("ru-RU")} ₸</div>
            <small>Перенаправляем к вашим заказам...</small>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;
