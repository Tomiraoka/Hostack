import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Icon from "../components/Icon";
import { menuApi } from "../api/menuApi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import "./MenuPage.css";

const CATEGORIES = ["Все", "Бургеры", "Пицца", "Напитки", "Салаты", "Десерты"];

function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("Все");

  const { isAuthenticated, isAdmin, isUser } = useAuth();
  const { addItem } = useCart();
  const toast = useToast();

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    setLoading(true);
    setError("");
    try {
      const data = await menuApi.getAll();
      setMenu(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const discountItems = useMemo(() => menu.filter((m) => m.discount), [menu]);

  const filteredItems = useMemo(() => {
    const nonDiscount = menu.filter((m) => !m.discount);
    if (activeCategory === "Все") return nonDiscount;
    return nonDiscount.filter((m) => m.category === activeCategory);
  }, [menu, activeCategory]);

  function handleAdd(item) {
    if (!isAuthenticated) {
      toast.info("Войдите в аккаунт, чтобы добавить блюдо в корзину");
      return;
    }
    if (isAdmin) {
      toast.info("Админ не может оформлять заказы");
      return;
    }
    if (!item.available) {
      toast.error("Блюдо сейчас недоступно");
      return;
    }
    addItem(item);
    toast.success(`«${item.name}» добавлен в корзину`);
  }

  if (loading) {
    return (
      <main className="menu-page">
        <div className="spinner"></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="menu-page">
        <div className="empty-state">
          <h2>Не удалось загрузить меню</h2>
          <p>{error}</p>
          <button className="auth-main-btn" style={{ maxWidth: 240, marginTop: 20 }} onClick={loadMenu}>
            Попробовать снова
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="menu-page">
        <section className="menu-header">
          <h1>Наше меню</h1>
          <p>Всё готовится с любовью и натуральными ингредиентами</p>
        </section>

        {discountItems.length > 0 && (
          <section className="menu-section discount-section">
            <h2><Icon name="zap" size={18} className="icon-inline" />Блюда со скидкой</h2>

            <div className="menu-grid">
              {discountItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAdd={handleAdd}
                  isUser={isUser}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          </section>
        )}

        <section className="menu-header category-area">
          <div className="category-buttons">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className={activeCategory === category ? "active" : ""}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="menu-section">
          <h2>
            <Icon name="dishes" size={18} className="icon-inline" />
            {activeCategory} ({filteredItems.length} позиций)
          </h2>

          {filteredItems.length === 0 ? (
            <div className="empty-state">В этой категории пока нет блюд</div>
          ) : (
            <div className="menu-grid">
              {filteredItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAdd={handleAdd}
                  isUser={isUser}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

function MenuCard({ item, onAdd, isUser, isAuthenticated }) {
  const isDisabled = !item.available;

  let buttonLabel = "＋ Добавить";
  if (isDisabled) buttonLabel = "Недоступно";
  else if (!isAuthenticated) buttonLabel = "Войти и заказать";
  else if (!isUser) buttonLabel = "Только для пользователей";

  return (
    <div className={`menu-card ${isDisabled ? "unavailable" : ""}`}>
      <div className="menu-img-box">
        <img src={item.image} alt={item.name} loading="lazy" />
        {item.badge && <span>{item.badge}</span>}
        {isDisabled && <div className="unavailable-overlay">Нет на складе</div>}
      </div>

      <div className="menu-card-content">
        <h3>{item.name}</h3>
        <p>{item.description}</p>

        <div className="menu-line"></div>

        <div className="menu-card-bottom">
          <div className="price-block">
            <strong>{item.price}₸</strong>
            {item.oldPrice > 0 && <del>{item.oldPrice}₸</del>}
          </div>
          <small>{item.size}</small>
        </div>

        {!isAuthenticated ? (
          <Link to="/login" className="card-btn-link">
            Войти и заказать
          </Link>
        ) : (
          <button
            disabled={isDisabled || !isUser}
            onClick={() => onAdd(item)}
          >
            {buttonLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default MenuPage;
