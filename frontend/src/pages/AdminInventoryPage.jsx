import { useEffect, useState } from "react";

import Icon from "../components/Icon";
import { inventoryApi } from "../api/inventoryApi";
import { useToast } from "../context/ToastContext";
import "./AdminPages.css";

const EMPTY_FORM = { name: "", category: "", quantity: 0, unit: "шт", minQuantity: 0 };

function getStockStatus(item) {
  if (item.quantity <= item.minQuantity) return "low";
  if (item.quantity <= item.minQuantity * 2) return "medium";
  return "good";
}

const STATUS_TEXT = { low: "Мало", medium: "Средне", good: "Достаточно" };

function AdminInventoryPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await inventoryApi.getAll();
      setItems(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      category: item.category || "",
      quantity: item.quantity ?? 0,
      unit: item.unit || "шт",
      minQuantity: item.minQuantity ?? 0
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Введите название продукта");
      return;
    }

    const payload = {
      ...form,
      quantity: Number(form.quantity),
      minQuantity: Number(form.minQuantity)
    };

    try {
      if (editingId) {
        await inventoryApi.update(editingId, payload);
        toast.success("Продукт обновлён");
      } else {
        await inventoryApi.create(payload);
        toast.success("Продукт добавлен");
      }
      closeForm();
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Удалить «${item.name}» со склада?`)) return;
    try {
      await inventoryApi.remove(item.id);
      toast.success("Продукт удалён");
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const stats = {
    total: items.length,
    good: items.filter((i) => getStockStatus(i) === "good").length,
    medium: items.filter((i) => getStockStatus(i) === "medium").length,
    low: items.filter((i) => getStockStatus(i) === "low").length
  };

  if (loading) return <main className="admin-page"><div className="spinner"></div></main>;

  return (
    <main className="admin-page">
      <header className="admin-header">
        <h1>Склад продуктов</h1>
        <p>Управляйте запасами на складе. Это влияет на доступность блюд в меню.</p>
      </header>

      <section className="inventory-stats">
        <div><h3>{stats.total}</h3><p>Всего</p></div>
        <div><h3>{stats.good}</h3><p>Достаточно</p></div>
        <div><h3>{stats.medium}</h3><p>Средне</p></div>
        <div className={stats.low > 0 ? "warn" : ""}><h3>{stats.low}</h3><p>Мало</p></div>
      </section>

      <section className="inventory-box">
        <div className="inventory-title">
          <h2>Список продуктов</h2>
          <button className="primary-btn" onClick={openCreate}>
            <Icon name="add" size={14} className="icon-inline" />Добавить продукт
          </button>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">На складе пока нет продуктов</div>
        ) : (
          <div className="inventory-table">
            <div className="inventory-row inventory-head">
              <span>Продукт</span>
              <span>Категория</span>
              <span>Количество</span>
              <span>Минимум</span>
              <span>Статус</span>
              <span>Действия</span>
            </div>

            {items.map((item) => {
              const status = getStockStatus(item);
              return (
                <div className="inventory-row" key={item.id}>
                  <span className="product-name">{item.name}</span>
                  <span>{item.category || "—"}</span>
                  <span>{item.quantity} {item.unit}</span>
                  <span>{item.minQuantity} {item.unit}</span>
                  <span className={`stock-status ${status}`}>{STATUS_TEXT[status]}</span>
                  <span className="row-actions">
                    <button className="row-btn" onClick={() => openEdit(item)} aria-label="Редактировать">
                      <Icon name="edit" size={14} />
                    </button>
                    <button className="row-btn danger" onClick={() => handleDelete(item)} aria-label="Удалить">
                      <Icon name="trash" size={14} />
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? "Редактировать продукт" : "Новый продукт"}</h2>

            <form onSubmit={submitForm}>
              <label>
                Название
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoFocus
                />
              </label>

              <label>
                Категория
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Мясо, Овощи, Молочные..."
                />
              </label>

              <div className="form-row">
                <label>
                  Количество
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    required
                  />
                </label>

                <label>
                  Единица
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  >
                    <option value="шт">шт</option>
                    <option value="кг">кг</option>
                    <option value="г">г</option>
                    <option value="л">л</option>
                    <option value="мл">мл</option>
                    <option value="пучок">пучок</option>
                  </select>
                </label>
              </div>

              <label>
                Минимальный остаток
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minQuantity}
                  onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={closeForm}>Отмена</button>
                <button type="submit" className="primary-btn">
                  {editingId ? "Сохранить" : "Добавить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminInventoryPage;
