import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./AuthPages.css";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function isValidEmail(value) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
  }

  function validate() {
    const next = {};
    if (!email.trim()) next.email = "Введите email";
    else if (!isValidEmail(email)) next.email = "Введите корректный email";

    if (!password.trim()) next.password = "Введите пароль";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      login(data);
      toast.success(`Добро пожаловать, ${data.name}!`);

      const from = location.state?.from;
      if (data.role === "ADMIN") navigate("/admin");
      else if (from && from !== "/login" && from !== "/register") navigate(from);
      else navigate("/menu");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleLogin} noValidate>
        <h1>Вход</h1>
        <p>Войдите в аккаунт Hostack</p>

        {serverError && <div className="server-error">{serverError}</div>}

        <div className="input-group">
          <input
            className={errors.email ? "input-error" : ""}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          {errors.email && <small>{errors.email}</small>}
        </div>

        <div className="input-group">
          <input
            className={errors.password ? "input-error" : ""}
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {errors.password && <small>{errors.password}</small>}
        </div>

        <button type="submit" className="auth-main-btn" disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </button>

        <div className="auth-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>
      </form>
    </main>
  );
}

export default LoginPage;
