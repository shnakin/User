import { apiFetch, clearAuthStorage, tryRefreshToken } from "./api";

const API_BASE = "http://localhost:8080";

export const getDocuments = (userId) =>
  apiFetch(`/api/users/${userId}/documents`);

export const uploadDocument = async (userId, file) => {
  let token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("file", file);

  const sendRequest = async (accessToken) => {
    return fetch(`${API_BASE}/api/users/${userId}/documents`, {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData,
    });
  };

  let res = await sendRequest(token);

  if (res.status === 401 || res.status === 403) {
    try {
      token = await tryRefreshToken();
      res = await sendRequest(token);
    } catch (err) {
      clearAuthStorage();
      throw new Error("Oturum süresi doldu, lütfen tekrar giriş yap");
    }
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "API error");
  }

  return data;
};

export const downloadDocument = async (userId, documentId, fileName) => {
  let token = localStorage.getItem("token");

  const sendRequest = async (accessToken) => {
    return fetch(
      `${API_BASE}/api/users/${userId}/documents/${documentId}/download`,
      {
        method: "GET",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      }
    );
  };

  let res = await sendRequest(token);

  if (res.status === 401 || res.status === 403) {
    try {
      token = await tryRefreshToken();
      res = await sendRequest(token);
    } catch (err) {
      clearAuthStorage();
      throw new Error("Oturum süresi doldu, lütfen tekrar giriş yap");
    }
  }

  if (!res.ok) {
    let message = "Dosya indirilemedi";

    try {
      const data = await res.json();
      message = data?.error || message;
    } catch {
    }

    throw new Error(message);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || "document";
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
};

export const deleteDocument = (userId, docId) =>
  apiFetch(`/api/users/${userId}/documents/${docId}`, {
    method: "DELETE",
  });