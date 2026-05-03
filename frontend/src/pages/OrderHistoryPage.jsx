import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Icon from "../components/Icon";
import OrderTimeline from "../components/OrderTimeline";
import CookingSchedule from "../components/CookingSchedule";
import { orderApi } from "../api/orderApi";
import { useAuth } from "../context/AuthContext";
import "./OrderHistoryPage.css";

const STATUS_TEXT = {
  ACCEPTED: "Принят",
  COOKING: "Готовится",
  READY: "Готов к получению",
  COURIER_DISPATCHED: "Курьер выехал",
  DELIVERED: "Доставлено",
  PICKED_UP: "Выдан"
};

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function isActiveOrder(order) {
  if (order.type === "DELIVERY") return order.status !== "DELIVERED";
  return order.status !== "PICKED_UP";
}

function OrderHistoryPage() {
  const { auth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();

  }, []);

  useEffect(() => {
    const hasActive = orders.some(isActiveOrder);
    const interval = setInterval(loadOrders, hasActive ? 4000 : 30000);
    return () => clearInterval(interval);

  }, [orders]);

  async function loadOrders() {
    try {
      const data = await orderApi.getByUser(auth.userId);
      setOrders(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="orders-page">
        <div className="spinner"></div>
      </main>
    );
  }

  return (
    <>
      <main className="orders-page">
        <section className="orders-header">
          <h1>История заказов</h1>
          <p>Статусы обновляются автоматически — обновлять страницу не нужно</p>
        </section>

        {error && (
          <div className="server-error" style={{ maxWidth: 600, margin: "0 auto 20px" }}>
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="empty-cart">
            <h2>У вас пока нет заказов</h2>
            <p>Закажите что-нибудь вкусное в нашем меню!</p>
            <Link to="/menu" className="empty-cart-btn">Перейти в меню</Link>
          </div>
        ) : (
          <section className="orders-layout">
            {orders.map((order) => (
              <div className={`order-card ${isActiveOrder(order) ? "active" : ""}`} key={order.id}>
                <div className="order-top">
                  <div>
                    <h2>Заказ #{order.id.slice(-6).toUpperCase()}</h2>
                    <p>Оформлен: {formatDateTime(order.createdAt)}</p>
                  </div>

                  <div className="order-badges">
                    <span className={`type-badge type-${(order.type || "PICKUP").toLowerCase()}`}>
                      <Icon name={order.type === "DELIVERY" ? "delivery" : "pickup"} size={13} />
                      {order.type === "DELIVERY" ? "Доставка" : "Самовывоз"}
                    </span>
                    <span className={`order-status status-${order.status?.toLowerCase()}`}>
                      {STATUS_TEXT[order.status] || order.status}
                    </span>
                  </div>
                </div>

                {order.type === "DELIVERY" && order.deliveryAddress && (
                  <div className="order-address">
                    <span><Icon name="address" size={16} /></span>
                    <p>{order.deliveryAddress}</p>
                  </div>
                )}

                {order.paid !== undefined && (
                  <div className={`order-payment ${order.paid ? "paid" : "unpaid"}`}>
                    {order.paid ? (
                      <>
                        <span><Icon name="card" size={16} /></span>
                        <p>
                          Оплачено картой <strong>•••• {order.cardLast4}</strong>
                        </p>
                      </>
                    ) : (
                      <>
                        <span><Icon name="cash" size={16} /></span>
                        <p>Оплата при получении</p>
                      </>
                    )}
                  </div>
                )}

                <OrderTimeline order={order} />

                {isActiveOrder(order) && order.estimatedReadyAt && (
                  <CookingSchedule order={order} />
                )}

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div className="order-item" key={index}>
                      <div>
                        <h3>{item.name}</h3>
                        <p>
                          {item.quantity} шт × {item.price}₸
                          {item.prepTime > 0 && (
                            <span className="prep-time">
                              {" "}· <Icon name="time" size={11} className="icon-inline" />{item.prepTime} мин
                            </span>
                          )}
                        </p>
                      </div>

                      <strong>{item.price * item.quantity}₸</strong>
                    </div>
                  ))}
                </div>

                <div className="order-bottom">
                  <div className="order-bottom-totals">
                    {order.discountPercent > 0 && (
                      <>
                        <div className="order-subline">
                          <span>Без скидки:</span>
                          <span>{(order.subtotal || 0).toLocaleString("ru-RU")}₸</span>
                        </div>
                        <div className="order-subline discount">
                          <span>
                            <Icon name="gift" size={13} className="icon-inline" />
                            Скидка постоянного клиента (−{order.discountPercent}%):
                          </span>
                          <span>−{(order.discountAmount || 0).toLocaleString("ru-RU")}₸</span>
                        </div>
                      </>
                    )}
                    <div className="order-total-line">
                      <span>Итого:</span>
                      <strong>{order.totalPrice.toLocaleString("ru-RU")}₸</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

export default OrderHistoryPage;
