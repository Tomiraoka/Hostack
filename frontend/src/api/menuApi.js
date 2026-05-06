import { api } from "./client";

export const menuApi = {
  getAll: () => api.get("/menu"),
  getPopular: (userId) => api.get(`/menu/popular/${userId}`),
  create: (item) => api.post("/menu", item),
  update: (id, item) => api.put(`/menu/${id}`, item),
  remove: (id) => api.del(`/menu/${id}`)
};
