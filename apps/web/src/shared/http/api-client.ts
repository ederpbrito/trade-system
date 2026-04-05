const API_BASE = "";

let csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export function getCsrfToken() {
  return csrfToken;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Cliente HTTP da SPA: credenciais, CSRF em mutações (excepto login).
 */
export async function apiFetch(path: string, init: RequestInit & { method?: Method } = {}) {
  const method = (init.method ?? "GET").toUpperCase() as Method;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  const isLogin = path.replace(API_BASE, "").split("?")[0] === "/api/v1/auth/login";
  if (isMutation && !isLogin && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    method,
    credentials: "include",
    headers,
  });
  return res;
}
