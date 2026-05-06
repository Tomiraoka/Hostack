import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddCardModal from "../components/AddCardModal";
import CardView from "../components/CardView";
import Icon from "../components/Icon";
import LoyaltyBadge from "../components/LoyaltyBadge";
import { adminApi } from "../api/adminApi";
import { cardApi } from "../api/cardApi";
import { loyaltyApi } from "../api/loyaltyApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./AuthPages.css";
import "./ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const { auth, logout, isAdmin, isManager, isUser } = useAuth();
  const toast = useToast();

  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loyalty, setLoyalty] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (isUser) {
      loadCards();
      loadLoyalty();
    } else {
      setLoadingCards(false);
    }
    if (isAdmin) {
      loadStats();
    }
  }, []);

  async function loadCards() {
    try {
      const data = await cardApi.getByUser(auth.userId);
      setCards(data);
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
      console.warn("loyalty load failed:", err.message);
    }
  }

  async function loadStats() {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.warn("stats load failed:", err.message);
    }
  }

  async function handleSubmitCard(formData) {
    setSubmitting(true);
    try {
      const newCard = await cardApi.create({ userId: auth.userId, ...formData });
      setCards((prev) => [newCard, ...prev]);
      setShowAddModal(false);
      toast.success(`Карта добавлена. Баланс: ${newCard.balance.toLocaleString("ru-RU")} ₸`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCard(card) {
    if (!confirm(`Удалить карту •••• ${card.last4}?`)) return;
    try {
      await cardApi.remove(card.id, auth.userId);
      setCards((prev) => prev.filter((c) => c.id !== card.id));
      toast.success("Карта удалена");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleLogout() {
    await logout();
    toast.info("Вы вышли из аккаунта");
    navigate("/");
  }

  const roleLabel = isAdmin ? "Администратор" : isManager ? "Менеджер" : "Пользователь";

  return (
    <main className="profile-page-wrap">
      <div className="profile-grid">
        <section className="profile-section">
          <h1>Профиль</h1>
          <p className="profile-subtitle">Добро пожаловать, {auth.name}</p>

          <div className="profile-info">
            <span>Имя:</span>
            <strong>{auth.name}</strong>
          </div>

          <div className="profile-info">
            <span>Email:</span>
            <strong>{auth.email}</strong>
          </div>

          <div className="profile-info">
            <span>Роль:</span>
            <strong>{roleLabel}</strong>
          </div>

          {isAdmin && stats && (
            <>
              <h2 className="profile-h2">Статистика заведения</h2>
              <div className="admin-revenue-card">
                <div className="admin-revenue-row">
                  <span>Общая выручка</span>
                  <strong>{Math.round(stats.totalRevenue || 0).toLocaleString("ru-RU")} ₸</strong>
                </div>
                <div className="admin-revenue-row">
                  <span>Выдано заказов</span>
                  <strong>{stats.deliveredOrders || 0}</strong>
                </div>
                <div className="admin-revenue-row">
                  <span>Всего заказов</span>
                  <strong>{stats.totalOrders || 0}</strong>
                </div>
              </div>
            </>
          )}

          {isUser && loyalty && (
            <>
              <h2 className="profile-h2">Программа лояльности</h2>
              <LoyaltyBadge loyalty={loyalty} />
            </>
          )}

          <button onClick={handleLogout} className="auth-logout-btn">
            Выйти из аккаунта
          </button>
        </section>

        {isUser && (
          <section className="profile-section">
            <div className="cards-section-header">
              <div>
                <h2 className="profile-h2 no-margin">Мои карты</h2>
                <p className="profile-subtitle">
                  Виртуальные карты для оплаты заказов на сайте
                </p>
              </div>
              <button
                className="primary-btn add-card-btn"
                onClick={() => setShowAddModal(true)}
              >
                <Icon name="add" size={14} className="icon-inline" />Добавить карту
              </button>
            </div>

            {loadingCards ? (
              <div className="spinner"></div>
            ) : cards.length === 0 ? (
              <div className="cards-empty">
                <div className="cards-empty-icon"><Icon name="card" size={36} /></div>
                <h3>Пока нет ни одной карты</h3>
                <p>Добавьте карту, чтобы оплачивать заказы прямо на сайте</p>
                <small>
                  Это симуляция — реальные деньги не списываются. При добавлении карты
                  на ней появится случайный демо-баланс.
                </small>
              </div>
            ) : (
              <div className="cards-list">
                {cards.map((card) => (
                  <CardView
                    key={card.id}
                    card={card}
                    onDelete={handleDeleteCard}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {showAddModal && (
        <AddCardModal
          onClose={() => !submitting && setShowAddModal(false)}
          onSubmit={handleSubmitCard}
          submitting={submitting}
        />
      )}
    </main>
  );
}

export default ProfilePage;
