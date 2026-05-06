import { useEffect, useState } from "react";

import Icon from "../components/Icon";
import { inventoryApi } from "../api/inventoryApi";
import { useToast } from "../context/ToastContext";
import "./AdminPages.css";

const CATEGORIES = [
  "Мясо",
  "Овощи",
  "Зелень",
  "Молочные",
  "Хлеб и выпечка",
  "Соусы",
  "Специи",
  "Напитки",
  "Сладкое",
  "Фрукты",
  "Крупы",
  "Масла",
  "Морепродукты",
  "Прочее"
];

const UNITS = ["шт", "кг", "г", "л", "мл", "пучок"];

const NAME_REGEX = /^[А-Яа-яЁёA-Za-z\s\-]{2,40}$/;

const EMPTY_FORM = {
  name: "",
  category: CATEGORIES[0],
  quantity: "",
  unit: "шт",
  minQuantity: ""
};

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
  const [errors, setErrors] = useState({});

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
    setErrors({});
    setShowForm(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      category: CATEGORIES.includes(item.category) ? item.category : CATEGORIES[0],
      quantity: item.quantity ?? "",
      unit: UNITS.includes(item.unit) ? item.unit : "шт",
      minQuantity: item.minQuantity ?? ""
    });
    setErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
  }

  function validate() {
    const next = {};

    const name = form.name.trim();
    if (!name) {
      next.name = "Введите название";
    } else if (!NAME_REGEX.test(name)) {
      next.name = "Только буквы и дефис, 2-40 символов";
    } else if (!editingId && items.some((i) => i.name.toLowerCase() === name.toLowerCase())) {
      next.name = "Продукт с таким названием уже существует";
    }

    if (!CATEGORIES.includes(form.category)) {
      next.category = "Выберите категорию из списка";
    }

    const qty = Number(form.quantity);
    if (form.quantity === "" || isNaN(qty)) {
      next.quantity = "Введите число";
    } else if (qty < 0) {
      next.quantity = "Не может быть отрицательным";
    } else if (qty > 100000) {
      next.quantity = "Слишком большое значение";
    }

    if (!UNITS.includes(form.unit)) {
      next.unit = "Выберите единицу";
    }

    const minQty = Number(form.minQuantity);
    if (form.minQuantity === "" || isNaN(minQty)) {
      next.minQuantity = "Введите число";
    } else if (minQty < 0) {
      next.minQuantity = "Не может быть отрицательным";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
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

  if (loading) {
    return <main className="admin-page"><p>Загружаем склад...</p></main>;
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Склад</h1>
          <p>Управление продуктами и остатками. Всего {items.length} позиций.</p>
        </div>
        <button className="primary-btn" onClick={openCreate}>
          <Icon name="add" size={14} className="icon-inline" />Добавить продукт
        </button>
      </header>

      <section className="admin-table">
        <div className="table-header inv-grid">
          <span>Название</span>
          <span>Категория</span>
          <span>Остаток</span>
          <span>Минимум</span>
          <span>Статус</span>
          <span></span>
        </div>

        {items.length === 0 ? (
          <div className="admin-empty">
            <Icon name="inventory" size={48} />
            <p>На складе пока нет продуктов</p>
          </div>
        ) : (
          <div className="table-body">
            {items.map((item) => {
              const status = getStockStatus(item);
              return (
                <div key={item.id} className="table-row inv-grid">
                  <span className="row-name">{item.name}</span>
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

            <form onSubmit={submitForm} noValidate>
              <label>
                Название
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[0-9]/g, "");
                    setForm({ ...form, name: v });
                  }}
                  className={errors.name ? "input-error" : ""}
                  maxLength={40}
                  autoFocus
                  placeholder="Например: Помидоры"
                />
                {errors.name && <small className="form-error">{errors.name}</small>}
              </label>

              <label>
                Категория
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={errors.category ? "input-error" : ""}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <small className="form-error">{errors.category}</small>}
              </label>

              <div className="form-row">
                <label>
                  Количество
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    step="0.01"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className={errors.quantity ? "input-error" : ""}
                    placeholder="0"
                  />
                  {errors.quantity && <small className="form-error">{errors.quantity}</small>}
                </label>

                <label>
                  Единица
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
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
                  className={errors.minQuantity ? "input-error" : ""}
                  placeholder="0"
                />
                {errors.minQuantity && <small className="form-error">{errors.minQuantity}</small>}
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
