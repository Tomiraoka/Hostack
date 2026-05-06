import { api } from "./client";

export const adminApi = {
  getStats: () => api.get("/admin/stats")
};
