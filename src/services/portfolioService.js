import { API_BASE_URL } from "./apiBase";
const PORTFOLIOS_KEY = "portfolios";

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

const parseMarks = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const raw = String(value).trim();
  const numericChunk = raw.includes("/") ? raw.split("/")[0] : raw;
  const parsed = Number(numericChunk);

  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeStatus = (status, reviewedFlag, marks) => {
  if (typeof status === "string" && status.trim()) {
    const clean = status.trim().toLowerCase();
    if (clean === "reviewed") return "Reviewed";
    if (clean === "submitted") return "Submitted";
    if (clean === "pending") return "Pending";
    return status;
  }

  if (reviewedFlag === true || marks !== null) {
    return "Reviewed";
  }

  return "Submitted";
};

const normalizePortfolio = (portfolio, fallbackEmail = "") => {
  const marks = parseMarks(portfolio?.marks ?? portfolio?.score ?? portfolio?.reviewMarks ?? portfolio?.reviewScore);
  const feedback = portfolio?.feedback ?? portfolio?.reviewFeedback ?? portfolio?.comments ?? "";
  const ownerEmail = (portfolio?.ownerEmail || portfolio?.email || fallbackEmail || "").trim().toLowerCase();

  return {
    ...portfolio,
    ownerEmail,
    marks,
    feedback,
    status: normalizeStatus(portfolio?.status ?? portfolio?.reviewStatus, portfolio?.reviewed, marks)
  };
};

const setLocalPortfolios = (portfolios) => {
  localStorage.setItem(PORTFOLIOS_KEY, JSON.stringify(portfolios));
};

const getLocalPortfoliosByEmail = (email) => {
  const cleanEmail = (email || "").trim().toLowerCase();
  const portfolios = readJson(PORTFOLIOS_KEY, []);
  return portfolios.filter(
    (item) => (item.ownerEmail || "").trim().toLowerCase() === cleanEmail
  );
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

export const fetchPortfolio = async (email) => {
  const cleanEmail = (email || "").trim().toLowerCase();
  const result = await apiRequest(`/portfolios?email=${encodeURIComponent(cleanEmail)}`);

  if (result.ok && result.data) {
    const backendItems = Array.isArray(result.data) ? result.data : [result.data];
    const normalized = backendItems.map((item) => normalizePortfolio(item, cleanEmail));

    const existing = readJson(PORTFOLIOS_KEY, []);
    const others = existing.filter(
      (item) => (item.ownerEmail || "").trim().toLowerCase() !== cleanEmail
    );
    setLocalPortfolios([...normalized, ...others]);

    const latest = normalized[0] || null;

    return {
      ok: true,
      data: latest,
      items: normalized,
      source: "backend"
    };
  }

  const localItems = getLocalPortfoliosByEmail(cleanEmail).map((item) =>
    normalizePortfolio(item, cleanEmail)
  );

  return {
    ok: true,
    data: localItems[0] || null,
    items: localItems,
    source: "local"
  };
};

export const savePortfolio = async (portfolio, email) => {
  const cleanEmail = (email || "").trim().toLowerCase();
  const localId = `local-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const payload = {
    ...portfolio,
    ownerEmail: cleanEmail,
    localId
  };

  const result = await apiRequest("/portfolios", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (result.ok) {
    const saved = {
      ...payload,
      ...(result.data || {})
    };
    const existing = readJson(PORTFOLIOS_KEY, []);
    setLocalPortfolios([saved, ...existing]);

    return {
      ok: true,
      data: saved,
      source: "backend"
    };
  }

  const existing = readJson(PORTFOLIOS_KEY, []);
  setLocalPortfolios([payload, ...existing]);

  return {
    ok: true,
    data: payload,
    source: "local",
    message: "Portfolio saved locally because backend portfolio endpoint is unavailable."
  };
};

export const fetchAllPortfolios = async () => {
  const result = await apiRequest("/portfolios/all");

  if (result.ok && Array.isArray(result.data)) {
    const normalized = result.data.map((item) => normalizePortfolio(item));
    setLocalPortfolios(normalized);

    return {
      ok: true,
      data: normalized,
      source: "backend"
    };
  }

  return {
    ok: true,
    data: readJson(PORTFOLIOS_KEY, []).map((item) => normalizePortfolio(item)),
    source: "local"
  };
};

export const reviewPortfolio = async ({ portfolioId, marks, feedback }) => {
  const result = await apiRequest(`/portfolios/${portfolioId}/review`, {
    method: "PATCH",
    body: JSON.stringify({
      marks: Number(marks),
      feedback,
      status: "Reviewed"
    })
  });

  const portfolios = readJson(PORTFOLIOS_KEY, []).map((portfolio) =>
    portfolio.id === portfolioId || portfolio.localId === portfolioId
      ? normalizePortfolio({
          ...portfolio,
          marks: Number(marks),
          feedback,
          status: "Reviewed"
        })
      : normalizePortfolio(portfolio)
  );
  setLocalPortfolios(portfolios);

  if (result.ok) {
    return {
      ok: true,
      source: "backend",
      data: result.data
    };
  }

  return {
    ok: true,
    source: "local",
    message: "Portfolio review saved locally because backend portfolio review endpoint is unavailable."
  };
};
