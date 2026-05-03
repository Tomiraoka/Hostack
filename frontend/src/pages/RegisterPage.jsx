import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./AuthPages.css";

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function isValidEmail(value) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
  }

  function validate() {
    const next = {};
    if (!name.trim()) next.name = "Введите имя";
    else if (name.trim().length < 2) next.name = "Имя должно быть минимум 2 символа";

    if (!email.trim()) next.email = "Введите email";
    else if (!isValidEmail(email)) next.email = "Введите корректный email";

    if (!password.trim()) next.password = "Введите пароль";
    else if (password.length < 8) next.password = "Пароль минимум 8 символов";
    else if (!/[A-Z]/.test(password)) next.password = "Пароль должен содержать заглавную букву";
    else if (!/[0-9]/.test(password)) next.password = "Пароль должен содержать цифру";

    if (!confirm.trim()) next.confirm = "Повторите пароль";
    else if (password !== confirm) next.confirm = "Пароли не совпадают";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRegister(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await authApi.register({ name, email, password });
      login(data);
      toast.success(`Аккаунт создан! Добро пожаловать, ${data.name}!`);

      if (data.role === "ADMIN") navigate("/admin");
      else navigate("/menu");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleRegister} noValidate>
        <h1>Регистрация</h1>
        <p>Создайте аккаунт Hostack</p>

        {serverError && <div className="server-error">{serverError}</div>}

        <div className="input-group">
          <input
            className={errors.name ? "input-error" : ""}
            type="text"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          {errors.name && <small>{errors.name}</small>}
        </div>

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
            autoComplete="new-password"
          />
          {errors.password && <small>{errors.password}</small>}
        </div>

        <div className="input-group">
          <input
            className={errors.confirm ? "input-error" : ""}
            type="password"
            placeholder="Повторите пароль"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
          {errors.confirm && <small>{errors.confirm}</small>}
        </div>

        <button type="submit" className="auth-main-btn" disabled={loading}>
          {loading ? "Создаём..." : "Создать аккаунт"}
        </button>

        <div className="auth-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </form>
    </main>
  );
}

export default RegisterPage;
