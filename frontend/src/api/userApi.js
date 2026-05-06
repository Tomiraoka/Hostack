import { api } from "./client";

export const userApi = {
  getAll: () => api.get("/admin/users"),
  updateRole: (userId, role) =>
    api.patch(`/admin/users/${userId}/role?role=${role}`),
  remove: (userId) => api.del(`/admin/users/${userId}`)
};
