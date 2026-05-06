import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Icon from "../components/Icon";
import { adminApi } from "../api/adminApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./AdminPages.css";

function AdminDashboardPage() {
  const { auth } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  async function load() {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <main className="admin-page"><p>Загружаем статистику...</p></main>;
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Здравствуйте, {auth?.name}</h1>
          <p>Панель администратора Hostack</p>
        </div>
      </header>

      <section className="admin-stats">
        <div className="stat-card stat-revenue">
          <div className="stat-icon">
            <Icon name="card" size={24} />
          </div>
          <div>
            <small>Общая выручка</small>
            <h2>{Math.round(stats?.totalRevenue || 0).toLocaleString("ru-RU")} ₸</h2>
            <p>За все выданные заказы</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Icon name="check" size={24} />
          </div>
          <div>
            <small>Выдано заказов</small>
            <h2>{stats?.deliveredOrders || 0}</h2>
            <p>Завершённых клиентами</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Icon name="bell" size={24} />
          </div>
          <div>
            <small>Всего заказов</small>
            <h2>{stats?.totalOrders || 0}</h2>
            <p>Включая активные</p>
          </div>
        </div>
      </section>

      <section className="admin-quick-actions">
        <h3>Быстрый доступ</h3>
        <div className="quick-actions-grid">
          <Link to="/admin/inventory" className="quick-action-card">
            <Icon name="inventory" size={28} />
            <strong>Склад</strong>
            <small>Продукты и остатки</small>
          </Link>
          <Link to="/admin/dishes" className="quick-action-card">
            <Icon name="dish" size={28} />
            <strong>Блюда</strong>
            <small>Управление меню</small>
          </Link>
          <Link to="/admin/users" className="quick-action-card">
            <Icon name="user" size={28} />
            <strong>Пользователи</strong>
            <small>Роли и права доступа</small>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboardPage;
