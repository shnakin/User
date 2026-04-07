import { apiFetch } from "./api";

export const getUsers = () => apiFetch("/api/users");

export const getUser = (id) => apiFetch(`/api/users/${id}`);

export const updateUser = (id, body) =>
  apiFetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });