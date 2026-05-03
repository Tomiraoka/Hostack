import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddCardModal from "../components/AddCardModal";
import CardView from "../components/CardView";
import Icon from "../components/Icon";
import LoyaltyBadge from "../components/LoyaltyBadge";
import { cardApi } from "../api/cardApi";
import { loyaltyApi } from "../api/loyaltyApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./AuthPages.css";
import "./ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const { auth, logout, isAdmin } = useAuth();
  const toast = useToast();

  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loyalty, setLoyalty] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      loadCards();
      loadLoyalty();
    } else {
      setLoadingCards(false);
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

  function handleLogout() {
    logout();
    toast.info("Вы вышли из аккаунта");
    navigate("/");
  }

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
            <strong>{isAdmin ? "Администратор" : "Пользователь"}</strong>
          </div>

          {!isAdmin && loyalty && (
            <>
              <h2 className="profile-h2">Программа лояльности</h2>
              <LoyaltyBadge loyalty={loyalty} />
            </>
          )}

          <button onClick={handleLogout} className="auth-logout-btn">
            Выйти из аккаунта
          </button>
        </section>

        {!isAdmin && (
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
