const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8080") + "/api";

const AUTH_KEY = "hostack_auth";

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
  } catch {
    return null;
  }
}

function setAuth(authData) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

let refreshPromise = null;

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  const auth = getAuth();
  if (!auth?.refreshToken) {
    return Promise.reject(new Error("Нет refresh token"));
  }

  refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: auth.refreshToken })
  })
    .then(async (res) => {
      if (!res.ok) {
        clearAuth();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
        throw new Error("Сессия истекла");
      }
      const data = await res.json();
      setAuth(data);
      return data;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function request(path, options = {}, isRetry = false) {
  const url = `${API_BASE}${path}`;
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  const auth = getAuth();
  if (auth?.accessToken) {
    headers.Authorization = `Bearer ${auth.accessToken}`;
  }

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err) {
    throw new Error("Сервер недоступен. Проверьте подключение к интернету.");
  }

  if (response.status === 401 && !isRetry && !path.startsWith("/auth/")) {
    try {
      await refreshAccessToken();
      return request(path, options, true);
    } catch (err) {
      throw new Error("Сессия истекла. Войдите снова.");
    }
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const message = data?.message || `Ошибка ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) =>
    request(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del: (path) => request(path, { method: "DELETE" })
};
