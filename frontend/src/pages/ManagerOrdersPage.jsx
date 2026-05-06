import { useEffect, useState } from "react";

import Icon from "../components/Icon";
import { orderApi } from "../api/orderApi";
import { useToast } from "../context/ToastContext";
import "./AdminPages.css";

const STATUS_TEXT = {
  ACCEPTED: "Принят",
  COOKING: "Готовится",
  READY: "Готов",
  DELIVERED: "Выдан"
};

const STATUS_FLOW = ["ACCEPTED", "COOKING", "READY", "DELIVERED"];

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function ManagerOrdersPage() {
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

  const filtered = orders.filter((order) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return order.status !== "DELIVERED";
    if (filter === "DELIVERED") return order.status === "DELIVERED";
    return true;
  });

  if (loading) {
    return <main className="admin-page"><p>Загружаем заказы...</p></main>;
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Управление заказами</h1>
          <p>Меняйте статусы заказов вручную, клиенты увидят изменение в реальном времени</p>
        </div>
        <div className="filter-tabs">
          <button
            className={filter === "ACTIVE" ? "active" : ""}
            onClick={() => setFilter("ACTIVE")}
          >
            Активные
          </button>
          <button
            className={filter === "DELIVERED" ? "active" : ""}
            onClick={() => setFilter("DELIVERED")}
          >
            Выданные
          </button>
          <button
            className={filter === "ALL" ? "active" : ""}
            onClick={() => setFilter("ALL")}
          >
            Все
          </button>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="admin-empty">
          <Icon name="bell" size={48} />
          <p>Нет заказов в этой категории</p>
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map((order) => {
            const isDelivered = order.status === "DELIVERED";
            return (
              <article key={order.id} className={`order-card ${isDelivered ? "final" : ""}`}>
                <header className="order-header">
                  <div>
                    <h3>Заказ #{order.id.slice(-6).toUpperCase()}</h3>
                    <small>{formatDateTime(order.createdAt)}</small>
                  </div>
                  <div className={`order-status status-${order.status}`}>
                    {STATUS_TEXT[order.status]}
                  </div>
                </header>

                <div className="order-meta">
                  <div>
                    <Icon name="user" size={14} className="icon-inline" />
                    {order.userName} · <small>{order.userEmail}</small>
                  </div>
                  <div>
                    <Icon name="delivery" size={14} className="icon-inline" />
                    {order.deliveryAddress || "Адрес не указан"}
                  </div>
                </div>

                <ul className="order-items">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      <span>{item.name}</span>
                      <span>×{item.quantity}</span>
                    </li>
                  ))}
                </ul>

                <div className="order-summary">
                  <span>Сумма</span>
                  {order.discountAmount > 0 && (
                    <small>
                      Скидка: −{(order.discountAmount || 0).toLocaleString("ru-RU")}₸
                      {order.discountPercent ? ` (${order.discountPercent}%)` : ""}
                    </small>
                  )}
                  <strong>{order.totalPrice.toLocaleString("ru-RU")}₸</strong>
                </div>

                {!isDelivered && (
                  <div className="order-actions">
                    {STATUS_FLOW.filter(s => s !== order.status).map((status) => (
                      <button
                        key={status}
                        className={`status-btn ${status === nextStatus(order.status) ? "next" : ""}`}
                        onClick={() => changeStatus(order, status)}
                      >
                        {STATUS_TEXT[status]}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

function nextStatus(current) {
  const i = STATUS_FLOW.indexOf(current);
  if (i < 0 || i >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[i + 1];
}

export default ManagerOrdersPage;
