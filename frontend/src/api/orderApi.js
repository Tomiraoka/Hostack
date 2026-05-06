import { api } from "./client";

export const orderApi = {
  create: (order) => api.post("/orders", order),
  getAll: () => api.get("/orders"),
  getByUser: (userId) => api.get(`/orders/user/${userId}`),
  updateStatus: (orderId, status) =>
    api.patch(`/orders/${orderId}/status?status=${status}`)
};
