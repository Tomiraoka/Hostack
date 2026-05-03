# Деплой Hostack

Backend → Render (Docker, free plan)
Frontend → Vercel (free plan)
DB → MongoDB Atlas (уже настроена)

---

## Перед началом

1. Зарегистрируйся на [github.com](https://github.com), [render.com](https://render.com), [vercel.com](https://vercel.com).
2. Создай **публичный** репозиторий на GitHub и запушь туда `Hostack-fixed/`. Render и Vercel читают код из GitHub.

```bash
cd Hostack-fixed
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<твой-логин>/hostack.git
git push -u origin main
```

---

## Шаг 1. MongoDB Atlas — Network Access

Зайди в [cloud.mongodb.com](https://cloud.mongodb.com) → твой кластер `Wanderly` → **Network Access** → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`). Без этого Render не подключится к базе.

---

## Шаг 2. Деплой Backend на Render

1. На Render → **New +** → **Web Service** → **Build and deploy from a Git repository** → выбери свой репозиторий.

2. Заполни поля:
   - **Name:** `hostack-backend`
   - **Region:** `Frankfurt` (или ближайший)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Docker` (Render сам найдёт `Dockerfile`)
   - **Plan:** `Free`

3. Раздел **Environment Variables** — добавь две:

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | `mongodb+srv://Tomiraoka:TU12LE02SHEV2009@wanderly.xroyaig.mongodb.net/hostack?retryWrites=true&w=majority&appName=Wanderly` |
   | `FRONTEND_URL` | пока пусто — заполнишь после Vercel |

4. **Create Web Service**. Render клонирует репо, соберёт Docker-образ и запустит. Первый билд ~5 минут. После «Live» появится URL вида:
   ```
   https://hostack-backend.onrender.com
   ```
   Скопируй его.

5. Проверь, открыв в браузере:
   ```
   https://hostack-backend.onrender.com/api/menu
   ```
   Должен вернуться JSON со списком блюд.

---

## Шаг 3. Деплой Frontend на Vercel

1. На Vercel → **Add New** → **Project** → **Import Git Repository** → выбери тот же репозиторий.

2. Заполни:
   - **Framework Preset:** `Vite` (определится автоматически)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (по умолчанию)
   - **Output Directory:** `dist` (по умолчанию)

3. Раскрой **Environment Variables** и добавь:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://hostack-backend.onrender.com` (URL из шага 2) |

4. **Deploy**. Через ~1 минуту будет готово. URL вида:
   ```
   https://hostack.vercel.app
   ```

---

## Шаг 4. Соединить фронт и бэк через CORS

Vercel-домен ещё не разрешён в CORS. Возвращайся на Render → **hostack-backend** → **Environment** → редактируй `FRONTEND_URL`:

```
https://hostack.vercel.app,https://*-yourname.vercel.app
```

Первый — продакшн домен. Второй — превью-деплои Vercel (опционально). Сохрани — Render автоматически перезапустит сервис.

---

## Шаг 5. Готово

Открой `https://hostack.vercel.app`, зарегистрируйся, добавь карту, оформи заказ.

---

## Особенности free-плана Render

- **Сервис засыпает после 15 минут без запросов.** Первый запрос после простоя занимает ~30–60 секунд (cold start). Обычно так выглядит: открыл сайт → «Сервер недоступен» → подождал 30 секунд → перезагрузил → всё работает.
- **512 МБ RAM, 0.1 CPU.** Хватает для проекта такого размера, но не больше.
- Для более серьёзного использования — Render Starter ($7/мес) держит сервис всегда живым.

---

## Обновление кода после деплоя

```bash
git add .
git commit -m "..."
git push
```

Render и Vercel сами увидят пуш, пересоберут и задеплоят. На Render новый билд ~3 минуты, на Vercel ~30 секунд.

---

## Возможные проблемы

**Render билд падает с `Cannot find Dockerfile`**
→ Проверь, что в Settings указано `Root Directory: backend`.

**Render → `MongoSocketOpenException`**
→ Network Access в Atlas не разрешает `0.0.0.0/0`.

**Vercel: на сайте 404 при переходе по `/menu` напрямую**
→ Проверь, что `frontend/vercel.json` есть в репозитории.

**Vercel: сайт открывается, но "Сервер недоступен"**
→ Открой DevTools → Network. Если запрос идёт на `localhost:8080` — `VITE_API_URL` не установлен. Если идёт на правильный URL, но 0/CORS — `FRONTEND_URL` на Render не содержит твой домен.

**Cold start слишком медленный**
→ Можно настроить cron-job (например, [cron-job.org](https://cron-job.org)) на пинг `https://hostack-backend.onrender.com/api/menu` раз в 10 минут — сервис не будет засыпать. Бесплатно.

---

## Безопасность для продакшена

Перед публичным запуском:

1. **Поменяй пароль админа** в `DatabaseSeeder.java` или удали его и создай вручную через регистрацию + ручное обновление роли в MongoDB.

2. **Создай отдельного MongoDB-пользователя** для production с минимальными правами на конкретную БД.

3. **Не оставляй `0.0.0.0/0`** в Atlas — добавь только IP Render. Render → твой сервис → **Settings** → внизу есть «Outbound IPs», скопируй их в Atlas Network Access.

4. **Включи rate limiting** на API (например, через Spring Cloud Gateway или Bucket4j) — иначе любой может задосить.
