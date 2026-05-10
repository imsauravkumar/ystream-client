const LOCAL_BACKEND_URL = "http://localhost:5000";

function stripTrailingSlash(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function isLocalUrl(value) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value);
}

function isLocalBrowser() {
  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

export function getBackendUrl() {
  const configuredUrl = stripTrailingSlash(import.meta.env.VITE_API_URL || import.meta.env.VITE_SOCKET_URL);

  if (configuredUrl && (!import.meta.env.PROD || !isLocalUrl(configuredUrl) || isLocalBrowser())) {
    return configuredUrl;
  }

  if (!import.meta.env.PROD || isLocalBrowser()) {
    return LOCAL_BACKEND_URL;
  }

  console.error("Production backend URL is not configured. Set VITE_API_URL and VITE_SOCKET_URL to your Railway backend URL in Vercel.");
  return "";
}

export function getBackendConfigMessage() {
  const configuredUrl = stripTrailingSlash(import.meta.env.VITE_API_URL || import.meta.env.VITE_SOCKET_URL);
  if (import.meta.env.PROD && configuredUrl && isLocalUrl(configuredUrl) && !isLocalBrowser()) {
    return "Vercel is still using localhost for the backend. Set VITE_API_URL and VITE_SOCKET_URL to your Railway backend URL, then redeploy.";
  }
  if (import.meta.env.PROD && !configuredUrl && !isLocalBrowser()) {
    return "Backend URL is missing. Set VITE_API_URL and VITE_SOCKET_URL to your Railway backend URL in Vercel, then redeploy.";
  }
  return "Server connection failed. Check your backend URL.";
}
