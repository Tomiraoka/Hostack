import { useEffect, useState } from "react";

import Icon from "../components/Icon";
import { orderApi } from "../api/orderApi";
import { useToast } from "../context/ToastContext";
import "./AdminPages.css";

const STATUS_TEXT = {
  ACCEPTED: "Принят",
  COOKING: "Готовится",
  READY: "Готов",
  COURIER_DISPATCHED: "Курьер выехал",
  DELIVERED: "Доставлено",
  PICKED_UP: "Выдан"
};

const PICKUP_STATUSES = ["ACCEPTED", "COOKING", "READY", "PICKED_UP"];
const DELIVERY_STATUSES = ["ACCEPTED", "COOKING", "READY", "COURIER_DISPATCHED", "DELIVERED"];

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function isFinalStatus(order) {
  if (order.type === "DELIVERY") return order.status === "DELIVERED";
  return order.status === "PICKED_UP";
}

function AdminOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ACTIVE");

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);

  }, []);

  async function load() {
    try {
      const data = await orderApi.getAll();
      setOrders(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(order, newStatus) {
    try {
      await orderApi.updateStatus(order.id, newStatus);
      toast.success(`Статус изменён: ${STATUS_TEXT[newStatus]}`);
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function confirmPickedUp(order) {
    if (!confirm(`Подтвердить, что клиент забрал заказ #${order.id.slice(-6).toUpperCase()}?`)) {
      return;
    }
    try {
      await orderApi.updateStatus(order.id, "PICKED_UP");
      toast.success("Заказ выдан клиенту");
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const filteredOrders = (() => {
    if (filter === "ALL") return orders;
    if (filter === "ACTIVE") return orders.filter((o) => !isFinalStatus(o));
    if (filter === "FINISHED") return orders.filter(isFinalStatus);
    if (filter === "READY_PICKUP") {

      return orders.filter((o) => o.type !== "DELIVERY" && o.status === "READY");
    }
    return orders.filter((o) => o.status === filter);
  })();

  const counts = {
    ALL: orders.length,
    ACTIVE: orders.filter((o) => !isFinalStatus(o)).length,
    FINISHED: orders.filter(isFinalStatus).length,
    READY_PICKUP: orders.filter((o) => o.type !== "DELIVERY" && o.status === "READY").length,
    ACCEPTED: orders.filter((o) => o.status === "ACCEPTED").length,
    COOKING: orders.filter((o) => o.status === "COOKING").length,
    READY: orders.filter((o) => o.status === "READY").length
  };

  if (loading) return <main className="admin-page"><div className="spinner"></div></main>;

  return (
    <main className="admin-page">
      <header className="admin-header">
        <h1>Управление заказами</h1>
        <p>
          Все статусы продвигаются автоматически. Самовывоз останавливается на «Готов» —
          подтвердите выдачу кнопкой <strong>«Клиент забрал заказ»</strong>.
        </p>
      </header>

      <section className="admin-filters">
        <button className={filter === "READY_PICKUP" ? "active urgent" : "urgent"} onClick={() => setFilter("READY_PICKUP")}>
          <Icon name="bell" size={14} className="icon-inline" />
          Готов к выдаче ({counts.READY_PICKUP})
        </button>
        <button className={filter === "ACTIVE" ? "active" : ""} onClick={() => setFilter("ACTIVE")}>
          В работе ({counts.ACTIVE})
        </button>
        <button className={filter === "ALL" ? "active" : ""} onClick={() => setFilter("ALL")}>
          Все ({counts.ALL})
        </button>
        <button className={filter === "ACCEPTED" ? "active" : ""} onClick={() => setFilter("ACCEPTED")}>
          Принят ({counts.ACCEPTED})
        </button>
        <button className={filter === "COOKING" ? "active" : ""} onClick={() => setFilter("COOKING")}>
          Готовится ({counts.COOKING})
        </button>
        <button className={filter === "READY" ? "active" : ""} onClick={() => setFilter("READY")}>
          Готов ({counts.READY})
        </button>
        <button className={filter === "FINISHED" ? "active" : ""} onClick={() => setFilter("FINISHED")}>
          Завершён ({counts.FINISHED})
        </button>
      </section>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">Нет заказов в этой категории</div>
      ) : (
        <section className="admin-orders-grid">
          {filteredOrders.map((order) => {
            const statuses = order.type === "DELIVERY" ? DELIVERY_STATUSES : PICKUP_STATUSES;

            const showPickupConfirm =
              order.type !== "DELIVERY" && order.status === "READY";

            return (
              <div className={`admin-order-card ${showPickupConfirm ? "ready-to-pickup" : ""}`} key={order.id}>
                <div className="admin-order-top">
                  <div>
                    <h3>#{order.id.slice(-6).toUpperCase()}</h3>
                    <small>{formatDateTime(order.createdAt)}</small>
                  </div>
                  <div className="admin-order-badges">
                    <span className={`type-badge type-${(order.type || "PICKUP").toLowerCase()}`}>
                      <Icon name={order.type === "DELIVERY" ? "delivery" : "pickup"} size={12} />
                      {order.type === "DELIVERY" ? "Доставка" : "Самовывоз"}
                    </span>
                    <span className={`order-status status-${order.status?.toLowerCase()}`}>
                      {STATUS_TEXT[order.status]}
                    </span>
                  </div>
                </div>

                <div className="admin-order-customer">
                  <strong>{order.userName}</strong>
                  <span>{order.userEmail}</span>
                  {order.deliveryAddress && (
                    <span className="customer-address">
                      <Icon name="address" size={12} className="icon-inline" />{order.deliveryAddress}
                    </span>
                  )}
                  {order.paid !== undefined && (
                    <span className={`customer-payment ${order.paid ? "paid" : ""}`}>
                      {order.paid
                        ? <><Icon name="card" size={12} className="icon-inline" />Оплачено картой •••• {order.cardLast4}</>
                        : <><Icon name="cash" size={12} className="icon-inline" />Оплата при получении</>}
                    </span>
                  )}
                </div>

                <div className="admin-order-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="admin-order-line">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{item.price * item.quantity}₸</span>
                    </div>
                  ))}
                </div>

                <div className="admin-order-total">
                  {order.discountPercent > 0 && (
                    <small>
                      Скидка постоянного клиента: −{order.discountPercent}%
                      ({(order.discountAmount || 0).toLocaleString("ru-RU")}₸)
                    </small>
                  )}
                  <div className="total-line">
                    <span>Итого:</span>
                    <strong>{order.totalPrice.toLocaleString("ru-RU")}₸</strong>
                  </div>
                </div>

                {showPickupConfirm && (
                  <button
                    className="pickup-confirm-btn"
                    onClick={() => confirmPickedUp(order)}
                  >
                    <Icon name="checkCircle" size={18} className="icon-inline" />
                    Клиент забрал заказ
                  </button>
                )}

                {order.type === "DELIVERY" && order.status !== "DELIVERED" && (
                  <div className="auto-mode-hint">
                    <Icon name="time" size={13} className="icon-inline" />
                    Доставка переключается автоматически по расписанию
                  </div>
                )}

                {order.type !== "DELIVERY" &&
                  order.status !== "READY" &&
                  order.status !== "PICKED_UP" && (
                    <div className="auto-mode-hint">
                      <Icon name="time" size={13} className="icon-inline" />
                      До «Готов» переключается автоматически
                    </div>
                  )}

                <div className="admin-order-actions">
                  <small className="manual-status-label">Ручное управление:</small>
                  <div className="status-btn-group">
                    {statuses.map((s) => (
                      <button
                        key={s}
                        className={`status-btn ${order.status === s ? "active" : ""}`}
                        onClick={() => changeStatus(order, s)}
                        disabled={order.status === s}
                        title={`Переключить на «${STATUS_TEXT[s]}»`}
                      >
                        {STATUS_TEXT[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default AdminOrdersPage;
