import { NavLink, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiLogOut } from "react-icons/fi";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { auth, isAuthenticated, isAdmin, isUser, logout } = useAuth();
  const { totalItems } = useCart();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <NavLink to="/" className="logo">
        <img src="/logo.png" alt="logo" className="logo-img" />
        <span>Hostack</span>
      </NavLink>

      <nav className="nav-links">
        <NavLink to="/" end>Главная</NavLink>
        <NavLink to="/menu">Меню</NavLink>

        {isUser && <NavLink to="/orders">Мои заказы</NavLink>}

        {isAdmin && (
          <>
            <NavLink to="/admin">Панель</NavLink>
            <NavLink to="/admin/inventory">Склад</NavLink>
            <NavLink to="/admin/dishes">Блюда</NavLink>
            <NavLink to="/admin/orders">Заказы</NavLink>
          </>
        )}
      </nav>

      <div className="auth-buttons">
        {isUser && (
          <NavLink to="/cart" className="cart-icon" aria-label="Корзина">
            <FiShoppingCart />
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </NavLink>
        )}

        {!isAuthenticated ? (
          <>
            <NavLink to="/login" className="login-btn">Войти</NavLink>
            <NavLink to="/register" className="register-btn">Регистрация</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/profile" className="profile-btn" title={auth.email}>
              {auth.name}
            </NavLink>
            <button className="logout-btn" onClick={handleLogout} title="Выйти">
              <FiLogOut />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
