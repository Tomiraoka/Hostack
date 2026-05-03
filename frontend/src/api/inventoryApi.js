import { api } from "./client";

export const inventoryApi = {
  getAll: () => api.get("/inventory"),
  create: (item) => api.post("/inventory", item),
  update: (id, item) => api.put(`/inventory/${id}`, item),
  remove: (id) => api.del(`/inventory/${id}`)
};
