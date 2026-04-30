const DEFAULT_LOCAL_API_URL = "http://localhost:8080";
const DEFAULT_PROD_API_URL = "https://springboot-projecttrack.up.railway.app";

const normalizeApiBaseUrl = (value) => {
  const trimmedValue = (value || "").trim().replace(/\/+$/, "");

  if (!trimmedValue) {
    return `${import.meta.env.DEV ? DEFAULT_LOCAL_API_URL : DEFAULT_PROD_API_URL}/api`;
  }

  return trimmedValue.endsWith("/api") ? trimmedValue : `${trimmedValue}/api`;
};

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);