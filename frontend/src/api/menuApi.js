import { api } from "./client";

export const menuApi = {
  getAll: () => api.get("/menu"),
  create: (item) => api.post("/menu", item),
  update: (id, item) => api.put(`/menu/${id}`, item),
  remove: (id) => api.del(`/menu/${id}`)
};
