import { refreshTokenRequest } from "./authApi";

const API_BASE = "http://localhost:8080";

export const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("loggedInUser");
};

export const tryRefreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw {
      status: 401,
      data: { error: "Refresh token bulunamadı" },
      message: "Refresh token bulunamadı",
    };
  }

  const refreshed = await refreshTokenRequest(refreshToken);

  localStorage.setItem("token", refreshed.accessToken);

  if (refreshed.refreshToken) {
    localStorage.setItem("refreshToken", refreshed.refreshToken);
  }

  return refreshed.accessToken;
};

export const apiFetch = async (url, options = {}) => {
  let token = localStorage.getItem("token");

  const buildHeaders = (accessToken) => {
    const headers = {
      ...(options.headers || {}),
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return headers;
  };

  const parseResponse = async (response) => {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }

    try {
      return await response.text();
    } catch {
      return null;
    }
  };

  let res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: buildHeaders(token),
  });

  if (res.status === 401 || res.status === 403) {
    try {
      token = await tryRefreshToken();

      res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: buildHeaders(token),
      });
    } catch (err) {
      clearAuthStorage();
      throw {
        status: 401,
        data: { error: "Oturum süresi doldu, lütfen tekrar giriş yap" },
        message: "Oturum süresi doldu, lütfen tekrar giriş yap",
      };
    }
  }

  const data = await parseResponse(res);

  if (!res.ok) {
    throw {
      status: res.status,
      data,
      message:
        data?.error ||
        (typeof data === "string" ? data : "") ||
        "API error",
    };
  }

  return data;
};