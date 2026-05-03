import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Icon from "../components/Icon";
import { menuApi } from "../api/menuApi";
import { inventoryApi } from "../api/inventoryApi";
import { orderApi } from "../api/orderApi";
import "./AdminPages.css";

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    menuCount: 0,
    availableCount: 0,
    inventoryCount: 0,
    lowStockCount: 0,
    ordersCount: 0,
    activeOrdersCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [menu, inventory, orders] = await Promise.all([
        menuApi.getAll(),
        inventoryApi.getAll(),
        orderApi.getAll()
      ]);

      const isActive = (o) => {
        if (o.type === "DELIVERY") return o.status !== "DELIVERED";
        return o.status !== "READY";
      };

      setStats({
        menuCount: menu.length,
        availableCount: menu.filter((m) => m.available).length,
        inventoryCount: inventory.length,
        lowStockCount: inventory.filter((i) => i.quantity <= i.minQuantity).length,
        ordersCount: orders.length,
        activeOrdersCount: orders.filter(isActive).length
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <main className="admin-page"><div className="spinner"></div></main>;

  return (
    <main className="admin-page">
      <header className="admin-header">
        <h1>Панель администратора</h1>
        <p>Управляйте меню, складом и заказами в одном месте</p>
      </header>

      {error && <div className="server-error">{error}</div>}

      <section className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-icon"><Icon name="dishes" size={24} /></div>
          <div className="dashboard-numbers">
            <strong>{stats.menuCount}</strong>
            <span>Блюд в меню</span>
          </div>
          <div className="dashboard-sub">
            Доступно сейчас: <b>{stats.availableCount}</b>
          </div>
          <Link to="/admin/dishes" className="dashboard-link">Управлять →</Link>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-icon dashboard-icon-info"><Icon name="inventory" size={24} /></div>
          <div className="dashboard-numbers">
            <strong>{stats.inventoryCount}</strong>
            <span>Продуктов на складе</span>
          </div>
          <div className={`dashboard-sub ${stats.lowStockCount > 0 ? "warn" : ""}`}>
            Заканчивается: <b>{stats.lowStockCount}</b>
          </div>
          <Link to="/admin/inventory" className="dashboard-link">Управлять →</Link>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-icon dashboard-icon-success"><Icon name="orders" size={24} /></div>
          <div className="dashboard-numbers">
            <strong>{stats.ordersCount}</strong>
            <span>Всего заказов</span>
          </div>
          <div className="dashboard-sub">
            В работе: <b>{stats.activeOrdersCount}</b>
          </div>
          <Link to="/admin/orders" className="dashboard-link">Управлять →</Link>
        </div>
      </section>

      <section className="dashboard-info">
        <h2>Как работает система</h2>
        <ul>
          <li>
            <strong>Склад</strong> — добавляете продукты с количеством. Когда продукта меньше минимума — он подсвечивается.
          </li>
          <li>
            <strong>Блюда</strong> — у каждого блюда указывается рецепт (какие продукты и сколько). Блюдо доступно к заказу, только если все ингредиенты есть на складе.
          </li>
          <li>
            <strong>Заказы</strong> — когда пользователь оформляет заказ, ингредиенты автоматически списываются со склада. Вы меняете статус: <em>Принят → Готовится → Готов</em>.
          </li>
        </ul>
      </section>
    </main>
  );
}

export default AdminDashboardPage;
