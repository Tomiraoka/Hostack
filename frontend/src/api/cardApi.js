import { api } from "./client";

export const cardApi = {
  getByUser: (userId) => api.get(`/cards/user/${userId}`),
  create: (data) => api.post("/cards", data),
  remove: (cardId, userId) => api.del(`/cards/${cardId}?userId=${userId}`)
};
