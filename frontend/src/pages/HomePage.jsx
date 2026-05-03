import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css";

function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <>
      <main className="home-page">
        <section className="home-hero">
          <div className="home-hero-text">
            <span className="home-label">Restaurant & Menu System</span>

            <h1>
              Свежая еда, <span>умные заказы</span> и уютный вкус.
            </h1>

            <p>
              Hostack — удобный ресторанный сайт, где можно смотреть меню,
              оформлять заказы, отслеживать статус блюд и получать скидки.
            </p>

            <div className="home-buttons">
              <Link to="/menu" className="home-btn-primary">Смотреть меню</Link>

              {isAuthenticated ? (
                isAdmin ? (
                  <Link to="/admin" className="home-btn-outline">Панель управления</Link>
                ) : (
                  <Link to="/orders" className="home-btn-outline">Мои заказы</Link>
                )
              ) : (
                <Link to="/register" className="home-btn-outline">Создать аккаунт</Link>
              )}
            </div>
          </div>

          <div className="home-image-box">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900"
              alt="restaurant food"
            />

            <div className="home-floating-card">
              <div className="home-floating-icon">
                <Icon name="zap" size={18} />
              </div>
              <div>
                <strong>Today Special</strong>
                <p>Honey Burger Combo</p>
                <span>2200₸</span>
              </div>
            </div>
          </div>
        </section>

        <section className="home-features">
          <div className="home-feature-card">
            <div className="icon-display">
              <Icon name="dishes" size={28} />
            </div>
            <h3>Свежее меню</h3>
            <p>Красивое меню с блюдами, ценами, временем готовки и скидками.</p>
          </div>

          <div className="home-feature-card">
            <div className="icon-display icon-display-info">
              <Icon name="inventory" size={28} />
            </div>
            <h3>Умный склад</h3>
            <p>Склад автоматически уменьшается после каждого заказа.</p>
          </div>

          <div className="home-feature-card">
            <div className="icon-display icon-display-success">
              <Icon name="cooking" size={28} />
            </div>
            <h3>Статусы заказа</h3>
            <p>Принят → Готовится → Готов. Вы всегда знаете, где ваш заказ.</p>
          </div>
        </section>

        <section className="home-about">
          <div>
            <h2>Почему Hostack?</h2>
            <p>
              Мы создаём удобную систему для ресторана: клиент быстро выбирает
              блюда, оформляет заказ, а админ контролирует склад и заказы.
            </p>
            <Link to="/menu" className="home-btn-primary">Перейти в меню</Link>
          </div>

          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900"
            alt="restaurant"
          />
        </section>
      </main>

      <Footer />
    </>
  );
}

export default HomePage;
