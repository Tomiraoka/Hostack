import { api } from "./client";

export const loyaltyApi = {
  getForUser: (userId) => api.get(`/loyalty/${userId}`)
};
