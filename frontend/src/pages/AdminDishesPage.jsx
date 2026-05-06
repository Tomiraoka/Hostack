import { useEffect, useState } from "react";

import Icon from "../components/Icon";
import { menuApi } from "../api/menuApi";
import { inventoryApi } from "../api/inventoryApi";
import { useToast } from "../context/ToastContext";
import "./AdminPages.css";

const CATEGORIES = ["Бургеры", "Пицца", "Напитки", "Салаты", "Десерты"];
const BADGES = ["", "Новинка", "Хит", "Острое", "Веган", "-15%", "-20%"];

const NAME_REGEX = /^[А-Яа-яЁёA-Za-z0-9\s\-,.()&'"!]{2,60}$/;
const URL_REGEX = /^(https?:\/\/[^\s]+|\/[^\s]+)$/;

const EMPTY_DISH = {
  name: "",
  category: CATEGORIES[0],
  description: "",
  price: "",
  oldPrice: "",
  size: "",
  image: "",
  badge: "",
  discount: false,
  preparationTime: "",
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
  const [errors, setErrors] = useState({});

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
    setErrors({});
    setShowForm(true);
  }

  function openEdit(dish) {
    setEditingId(dish.id);
    setForm({
      name: dish.name || "",
      category: CATEGORIES.includes(dish.category) ? dish.category : CATEGORIES[0],
      description: dish.description || "",
      price: dish.price ?? "",
      oldPrice: dish.oldPrice ?? "",
      size: dish.size || "",
      image: dish.image || "",
      badge: BADGES.includes(dish.badge) ? dish.badge : "",
      discount: !!dish.discount,
      preparationTime: dish.preparationTime ?? "",
      ingredients: (dish.ingredients || []).map((i) => ({ name: i.name, amount: i.amount }))
    });
    setErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm(EMPTY_DISH);
    setEditingId(null);
    setErrors({});
  }

  function addIngredient() {
    setForm((f) => ({
      ...f,
      ingredients: [...f.ingredients, { name: "", amount: 0.1 }]
    }));
  }

  function updateIngredient(index, field, value) {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: field === "amount" ? value : value } : ing
      )
    }));
  }

  function removeIngredient(index) {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.filter((_, i) => i !== index)
    }));
  }

  function validate() {
    const next = {};

    const name = form.name.trim();
    if (!name) {
      next.name = "Введите название";
    } else if (!NAME_REGEX.test(name)) {
      next.name = "2-60 символов, без спецсимволов";
    } else if (!editingId && dishes.some((d) => d.name.toLowerCase() === name.toLowerCase())) {
      next.name = "Блюдо с таким названием уже есть";
    }

    if (!CATEGORIES.includes(form.category)) {
      next.category = "Выберите категорию из списка";
    }

    if (form.description && form.description.length > 200) {
      next.description = "Не более 200 символов";
    }

    const price = Number(form.price);
    if (form.price === "" || isNaN(price)) {
      next.price = "Введите цену";
    } else if (price <= 0) {
      next.price = "Цена должна быть больше 0";
    } else if (price > 1000000) {
      next.price = "Слишком большая цена";
    }

    if (form.oldPrice !== "" && form.oldPrice !== 0) {
      const old = Number(form.oldPrice);
      if (isNaN(old)) {
        next.oldPrice = "Должно быть числом";
      } else if (old < 0) {
        next.oldPrice = "Не может быть отрицательной";
      } else if (old > 0 && old <= price) {
        next.oldPrice = "Старая цена должна быть больше текущей";
      }
    }

    const prep = Number(form.preparationTime);
    if (form.preparationTime === "" || isNaN(prep)) {
      next.preparationTime = "Введите время";
    } else if (prep < 1) {
      next.preparationTime = "Минимум 1 минута";
    } else if (prep > 120) {
      next.preparationTime = "Максимум 120 минут";
    }

    if (form.size && form.size.length > 30) {
      next.size = "Не более 30 символов";
    }

    if (form.image && !URL_REGEX.test(form.image)) {
      next.image = "Должен быть URL (http://, https:// или /путь)";
    }

    if (form.badge && !BADGES.includes(form.badge)) {
      next.badge = "Выберите из списка";
    }

    for (let i = 0; i < form.ingredients.length; i++) {
      const ing = form.ingredients[i];
      if (!ing.name) {
        next[`ing_name_${i}`] = "Выберите продукт";
      }
      const amount = Number(ing.amount);
      if (!ing.amount || isNaN(amount) || amount <= 0) {
        next[`ing_amount_${i}`] = "Количество > 0";
      }
    }

    const ingNames = form.ingredients.map((i) => i.name).filter(Boolean);
    if (new Set(ingNames).size !== ingNames.length) {
      next.ingredients = "Один и тот же продукт указан несколько раз";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Проверьте поля формы");
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price),
      oldPrice: Number(form.oldPrice) || 0,
      size: form.size.trim(),
      image: form.image.trim(),
      badge: form.badge,
      discount: !!form.discount,
      preparationTime: Number(form.preparationTime),
      ingredients: form.ingredients
        .filter((ing) => ing.name && Number(ing.amount) > 0)
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
        <div>
          <h1>Управление блюдами</h1>
          <p>Создавайте, редактируйте и удаляйте блюда. Рецепт определяет, какие продукты списываются при заказе.</p>
        </div>
        <button className="primary-btn" onClick={openCreate}>
          <Icon name="add" size={14} className="icon-inline" />Добавить блюдо
        </button>
      </header>

      <section className="inventory-box">
        {dishes.length === 0 ? (
          <div className="empty-state">Пока нет ни одного блюда</div>
        ) : (
          <div className="dishes-grid">
            {dishes.map((dish) => (
              <div key={dish.id} className={`dish-admin-card ${!dish.available ? "unavailable" : ""}`}>
                <div className="dish-admin-img">
                  {dish.image
                    ? <img src={dish.image} alt={dish.name} loading="lazy" />
                    : <div className="no-image"><Icon name="dishes" size={36} /></div>}
                  {!dish.available && <div className="unavailable-overlay">Нет ингредиентов</div>}
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

            <form onSubmit={submitForm} noValidate>
              <div className="form-row">
                <label>
                  Название
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={errors.name ? "input-error" : ""}
                    maxLength={60}
                    autoFocus
                    placeholder="Honey Burger"
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
              </div>

              <label>
                Описание
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={errors.description ? "input-error" : ""}
                  maxLength={200}
                  placeholder="Сочный бургер с медовой глазурью..."
                />
                {errors.description && <small className="form-error">{errors.description}</small>}
              </label>

              <div className="form-row">
                <label>
                  Цена (₸)
                  <input
                    type="number"
                    min="1"
                    max="1000000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={errors.price ? "input-error" : ""}
                    placeholder="1500"
                  />
                  {errors.price && <small className="form-error">{errors.price}</small>}
                </label>

                <label>
                  Старая цена (опц.)
                  <input
                    type="number"
                    min="0"
                    value={form.oldPrice}
                    onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                    className={errors.oldPrice ? "input-error" : ""}
                    placeholder="0"
                  />
                  {errors.oldPrice && <small className="form-error">{errors.oldPrice}</small>}
                </label>

                <label>
                  Время готовки (мин)
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={form.preparationTime}
                    onChange={(e) => setForm({ ...form, preparationTime: e.target.value })}
                    className={errors.preparationTime ? "input-error" : ""}
                    placeholder="5"
                  />
                  {errors.preparationTime && <small className="form-error">{errors.preparationTime}</small>}
                </label>
              </div>

              <div className="form-row">
                <label>
                  Размер (опц.)
                  <input
                    type="text"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    className={errors.size ? "input-error" : ""}
                    maxLength={30}
                    placeholder="350 г, 30 см, 300 мл..."
                  />
                  {errors.size && <small className="form-error">{errors.size}</small>}
                </label>

                <label>
                  Бейдж
                  <select
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className={errors.badge ? "input-error" : ""}
                  >
                    <option value="">— без бейджа —</option>
                    {BADGES.filter(Boolean).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  {errors.badge && <small className="form-error">{errors.badge}</small>}
                </label>
              </div>

              <label>
                Картинка (URL)
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className={errors.image ? "input-error" : ""}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.image && <small className="form-error">{errors.image}</small>}
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

                {errors.ingredients && (
                  <small className="form-error">{errors.ingredients}</small>
                )}

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
                      className={errors[`ing_name_${idx}`] ? "input-error" : ""}
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
                      min="0.001"
                      step="0.01"
                      value={ing.amount}
                      onChange={(e) => updateIngredient(idx, "amount", e.target.value)}
                      className={errors[`ing_amount_${idx}`] ? "input-error" : ""}
                      placeholder="Кол-во"
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
