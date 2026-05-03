const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8080") + "/api";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  try {
    const auth = JSON.parse(localStorage.getItem("hostack_auth") || "null");
    if (auth?.token) {
      headers.Authorization = `Bearer ${auth.token}`;
    }
  } catch {

  }

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err) {
    throw new Error("Сервер недоступен. Проверьте подключение к интернету.");
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
