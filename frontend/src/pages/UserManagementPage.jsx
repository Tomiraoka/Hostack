import { useEffect, useState } from "react";

import Icon from "../components/Icon";
import { userApi } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./AdminPages.css";

const ROLES = [
  { value: "USER", label: "Пользователь" },
  { value: "MANAGER", label: "Менеджер" },
  { value: "ADMIN", label: "Администратор" }
];

const ROLE_LABEL = {
  USER: "Пользователь",
  MANAGER: "Менеджер",
  ADMIN: "Администратор"
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });
}

function UserManagementPage() {
  const toast = useToast();
  const { auth } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(user, newRole) {
    if (user.id === auth.userId) {
      toast.error("Нельзя менять роль самому себе");
      return;
    }
    if (!confirm(`Назначить ${user.name} роль «${ROLE_LABEL[newRole]}»?`)) return;

    setUpdating(user.id);
    try {
      await userApi.updateRole(user.id, newRole);
      toast.success(`Роль изменена: ${user.name} → ${ROLE_LABEL[newRole]}`);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function deleteUser(user) {
    if (user.id === auth.userId) {
      toast.error("Нельзя удалить самого себя");
      return;
    }
    if (!confirm(`Удалить пользователя ${user.name} (${user.email})?\nЭто действие нельзя отменить.`)) return;

    try {
      await userApi.remove(user.id);
      toast.success("Пользователь удалён");
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) {
    return <main className="admin-page"><p>Загружаем пользователей...</p></main>;
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Управление пользователями</h1>
          <p>Назначайте роли менеджеров и администраторов. Всего {users.length} пользователей.</p>
        </div>
      </header>

      <section className="admin-table">
        <div className="table-header users-grid">
          <span>Имя</span>
          <span>Email</span>
          <span>Роль</span>
          <span>Регистрация</span>
          <span>Статус</span>
          <span></span>
        </div>

        {users.length === 0 ? (
          <div className="admin-empty">
            <Icon name="user" size={48} />
            <p>Нет пользователей</p>
          </div>
        ) : (
          <div className="table-body">
            {users.map((user) => {
              const isMe = user.id === auth.userId;
              return (
                <div key={user.id} className="table-row users-grid">
                  <span className="row-name">
                    {user.name}
                    {isMe && <small className="me-tag"> (это вы)</small>}
                  </span>
                  <span>{user.email}</span>
                  <span>
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user, e.target.value)}
                      disabled={isMe || updating === user.id}
                      className={`role-select role-${user.role.toLowerCase()}`}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </span>
                  <span>{formatDate(user.createdAt)}</span>
                  <span>
                    {user.locked ? (
                      <span className="stock-status low">Заблокирован</span>
                    ) : (
                      <span className="stock-status good">Активен</span>
                    )}
                  </span>
                  <span className="row-actions">
                    <button
                      className="row-btn danger"
                      onClick={() => deleteUser(user)}
                      disabled={isMe}
                      aria-label="Удалить"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="admin-info-box">
        <h3>
          <Icon name="info" size={16} className="icon-inline" />
          Как это работает
        </h3>
        <ul>
          <li>Любой зарегистрированный пользователь начинает с роли «Пользователь»</li>
          <li>Назначьте кого-то менеджером — он получит доступ к управлению заказами</li>
          <li>Назначьте администратором — получит полный доступ к системе</li>
          <li>При смене роли пользователь будет вынужден войти заново</li>
          <li>Нельзя удалить или понизить последнего администратора</li>
        </ul>
      </section>
    </main>
  );
}

export default UserManagementPage;
