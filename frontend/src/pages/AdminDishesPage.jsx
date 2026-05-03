import { useEffect, useState } from "react";

import Icon from "../components/Icon";
import { menuApi } from "../api/menuApi";
import { inventoryApi } from "../api/inventoryApi";
import { useToast } from "../context/ToastContext";
import "./AdminPages.css";

const EMPTY_DISH = {
  name: "",
  category: "",
  description: "",
  price: 0,
  oldPrice: 0,
  size: "",
  image: "",
  badge: "",
  discount: false,
  preparationTime: 5,
  ingredients: []
};

function AdminDishesPage() {
  const toast = useToast();
  const [dishes, setDishes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_DISH);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [menu, inv] = await Promise.all([menuApi.getAll(), inventoryApi.getAll()]);
      setDishes(menu);
      setInventory(inv);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_DISH);
    setShowForm(true);
  }

  function openEdit(dish) {
    setEditingId(dish.id);
    setForm({
      name: dish.name || "",
      category: dish.category || "",
      description: dish.description || "",
      price: dish.price ?? 0,
      oldPrice: dish.oldPrice ?? 0,
      size: dish.size || "",
      image: dish.image || "",
      badge: dish.badge || "",
      discount: !!dish.discount,
      preparationTime: dish.preparationTime ?? 5,
      ingredients: (dish.ingredients || []).map((i) => ({ name: i.name, amount: i.amount }))
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm(EMPTY_DISH);
    setEditingId(null);
  }

  function addIngredient() {
    setForm((f) => ({
      ...f,
      ingredients: [...f.ingredients, { name: "", amount: 1 }]
    }));
  }

  function updateIngredient(index, field, value) {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: field === "amount" ? Number(value) : value } : ing
      )
    }));
  }

  function removeIngredient(index) {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.filter((_, i) => i !== index)
    }));
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Введите название блюда");
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      oldPrice: Number(form.oldPrice),
      preparationTime: Number(form.preparationTime),
      ingredients: form.ingredients
        .filter((ing) => ing.name && ing.amount > 0)
        .map((ing) => ({ name: ing.name, amount: Number(ing.amount) }))
    };

    try {
      if (editingId) {
        await menuApi.update(editingId, payload);
        toast.success("Блюдо обновлено");
      } else {
        await menuApi.create(payload);
        toast.success("Блюдо добавлено");
      }
      closeForm();
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete(dish) {
    if (!confirm(`Удалить блюдо «${dish.name}»?`)) return;
    try {
      await menuApi.remove(dish.id);
      toast.success("Блюдо удалено");
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) return <main className="admin-page"><div className="spinner"></div></main>;

  return (
    <main className="admin-page">
      <header className="admin-header">
        <h1>Управление блюдами</h1>
        <p>Создавайте, редактируйте и удаляйте блюда. Рецепт определяет, какие продукты списываются при заказе.</p>
      </header>

      <section className="inventory-box">
        <div className="inventory-title">
          <h2>Все блюда ({dishes.length})</h2>
          <button className="primary-btn" onClick={openCreate}>
            <Icon name="add" size={14} className="icon-inline" />Добавить блюдо
          </button>
        </div>

        {dishes.length === 0 ? (
          <div className="empty-state">Пока нет ни одного блюда</div>
        ) : (
          <div className="dishes-grid">
            {dishes.map((dish) => (
              <div key={dish.id} className={`dish-admin-card ${!dish.available ? "unavailable" : ""}`}>
                <div className="dish-admin-img">
                  {dish.image
                    ? <img src={dish.image} alt={dish.name} />
                    : <div className="no-image"><Icon name="dishes" size={36} /></div>}
                  {!dish.available && <div className="unavailable-overlay">Недоступно</div>}
                </div>

                <div className="dish-admin-content">
                  <h3>{dish.name}</h3>
                  <small>{dish.category}</small>
                  <p>{dish.description}</p>
                  <div className="dish-meta">
                    <strong>{dish.price}₸</strong>
                    <span>· {dish.preparationTime} мин</span>
                    <span>· {dish.ingredients?.length || 0} ингр.</span>
                  </div>
                </div>

                <div className="dish-admin-actions">
                  <button className="row-btn" onClick={() => openEdit(dish)}>
                    <Icon name="edit" size={14} className="icon-inline" />Изменить
                  </button>
                  <button className="row-btn danger" onClick={() => handleDelete(dish)}>
                    <Icon name="trash" size={14} className="icon-inline" />Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? "Редактировать блюдо" : "Новое блюдо"}</h2>

            <form onSubmit={submitForm}>
              <div className="form-row">
                <label>
                  Название *
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
                    list="categories-list"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Бургеры / Пицца / Напитки..."
                  />
                  <datalist id="categories-list">
                    <option value="Бургеры" />
                    <option value="Пицца" />
                    <option value="Напитки" />
                    <option value="Салаты" />
                    <option value="Десерты" />
                  </datalist>
                </label>
              </div>

              <label>
                Описание
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>

              <div className="form-row">
                <label>
                  Цена (₸) *
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </label>

                <label>
                  Старая цена (для скидки)
                  <input
                    type="number"
                    min="0"
                    value={form.oldPrice}
                    onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                  />
                </label>

                <label>
                  Время готовки (мин)
                  <input
                    type="number"
                    min="1"
                    value={form.preparationTime}
                    onChange={(e) => setForm({ ...form, preparationTime: e.target.value })}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Размер
                  <input
                    type="text"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    placeholder="350 г, 30 см, 300 мл..."
                  />
                </label>

                <label>
                  Бейдж
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="-15%, NEW..."
                  />
                </label>
              </div>

              <label>
                Картинка (URL)
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                />
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.checked })}
                />
                Показывать в блоке «Скидки»
              </label>

              <div className="ingredients-section">
                <div className="ingredients-header">
                  <h3>Рецепт (ингредиенты)</h3>
                  <button type="button" className="secondary-btn small" onClick={addIngredient}>
                    <Icon name="add" size={12} className="icon-inline" />Добавить
                  </button>
                </div>

                {form.ingredients.length === 0 && (
                  <p className="hint">
                    Без ингредиентов блюдо всегда будет «доступно». Добавьте продукты, чтобы система проверяла склад.
                  </p>
                )}

                {form.ingredients.map((ing, idx) => (
                  <div key={idx} className="ingredient-row">
                    <select
                      value={ing.name}
                      onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                      required
                    >
                      <option value="">— выберите продукт —</option>
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.name}>
                          {inv.name} ({inv.unit})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={ing.amount}
                      onChange={(e) => updateIngredient(idx, "amount", e.target.value)}
                      placeholder="Количество"
                    />

                    <button
                      type="button"
                      className="row-btn danger"
                      onClick={() => removeIngredient(idx)}
                      aria-label="Удалить ингредиент"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={closeForm}>Отмена</button>
                <button type="submit" className="primary-btn">
                  {editingId ? "Сохранить" : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDishesPage;
