const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080") + "/api";
const DEADLINES_KEY = "deadlines";

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

const setLocalDeadlines = (deadlines) => {
  localStorage.setItem(DEADLINES_KEY, JSON.stringify(deadlines));
};

const apiRequest = async (path, options = {}) => {
  try {
    const response = await fetch(API_BASE_URL + path, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(options.headers || {})
      },
      ...options
    });

    const raw = await response.text();
    let data = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      return {
        ok: false,
        message: data.message || "Request failed"
      };
    }

    return {
      ok: true,
      data
    };
  } catch {
    return {
      ok: false,
      message: "Unable to connect to backend"
    };
  }
};

export const fetchDeadlines = async (email = "") => {
  const endpoint = email
    ? `/deadlines?email=${encodeURIComponent(email.trim().toLowerCase())}`
    : "/deadlines";

  const result = await apiRequest(endpoint);

  if (result.ok && Array.isArray(result.data)) {
    setLocalDeadlines(result.data);
    return {
      ok: true,
      data: result.data,
      source: "backend"
    };
  }

  return {
    ok: true,
    data: readJson(DEADLINES_KEY, []),
    source: "local"
  };
};

export const createDeadline = async (deadline) => {
  const payload = {
    id: Date.now(),
    ...deadline
  };

  const result = await apiRequest("/deadlines", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (result.ok) {
    const saved = {
      ...payload,
      ...(result.data || {})
    };
    const existing = readJson(DEADLINES_KEY, []);
    setLocalDeadlines([saved, ...existing.filter((d) => d.id !== saved.id)]);

    return {
      ok: true,
      data: saved,
      source: "backend"
    };
  }

  const existing = readJson(DEADLINES_KEY, []);
  setLocalDeadlines([payload, ...existing]);

  return {
    ok: true,
    data: payload,
    source: "local",
    message: "Deadline saved locally because backend deadline endpoint is unavailable."
  };
};
