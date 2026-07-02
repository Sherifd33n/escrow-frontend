/**
 * Escrow Platform — API Client
 * Place this file at:  src/utils/api.js
 *
 * All functions return { data, error }.
 * On success: data = response payload, error = null
 * On failure: data = null, error = string message
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// ─── Core fetch wrapper ──────────────────────────────────────────
async function request(method, path, body, auth = true) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = sessionStorage.getItem("vp_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { data: null, error: json.error || `Request failed (${res.status})` };
    }
    return { data: json, error: null };
  } catch (err) {
    return { data: null, error: "Network error — is the server running?" };
  }
}

const get    = (path, auth) => request("GET",    path, null,  auth);
const post   = (path, body, auth) => request("POST",   path, body,  auth);
const patch  = (path, body, auth) => request("PATCH",  path, body,  auth);
const del    = (path, auth) => request("DELETE", path, null,  auth);

// ─── Token helpers ───────────────────────────────────────────────
export function saveToken(token) {
  sessionStorage.setItem("vp_token", token);
}
export function clearToken() {
  sessionStorage.removeItem("vp_token");
  sessionStorage.removeItem("vp_user");
  sessionStorage.removeItem("vp_page");
}

// ─── AUTH ────────────────────────────────────────────────────────
export const auth = {
  signup: (name, email, password, role) =>
    post("/auth/signup", { name, email, password, role }, false),

  login: (email, password) =>
    post("/auth/login", { email, password }, false),

  verifyOTP: (userId, code) =>
    post("/auth/verify-otp", { userId, code }, false),

  resendOTP: (userId) =>
    post("/auth/resend-otp", { userId }, false),

  forgotPassword: (email) =>
    post("/auth/forgot-password", { email }, false),

  resetPassword: (email, code, newPassword) =>
    post("/auth/reset-password", { email, code, newPassword }, false),

  me: () =>
    get("/auth/me"),
};

// ─── TRANSACTIONS ────────────────────────────────────────────────
export const transactions = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/transactions${qs ? "?" + qs : ""}`);
  },

  create: (data) =>
    post("/transactions", data),

  get: (id) =>
    get(`/transactions/${id}`),

  updateStatus: (id, status, ai_audit_note) =>
    patch(`/transactions/${id}/status`, { status, ai_audit_note }),

  addMilestone: (txnId, data) =>
    post(`/transactions/${txnId}/milestones`, data),

  updateMilestone: (milestoneId, data) =>
    patch(`/transactions/milestones/${milestoneId}/status`, data),
};

// ─── WALLET ──────────────────────────────────────────────────────
export const wallet = {
  get: () =>
    get("/wallet"),

  deposit: (amount) =>
    post("/wallet/deposit", { amount }),

  withdraw: (amount, bankId, accountNumber) =>
    post("/wallet/withdraw", { amount, bankId, accountNumber }),

  history: (page = 1) =>
    get(`/wallet/history?page=${page}`),
};

// ─── USERS ───────────────────────────────────────────────────────
export const users = {
  getProfile: () =>
    get("/users/profile"),

  updateProfile: (data) =>
    patch("/users/profile", data),

  updateKYC: (tier) =>
    patch("/users/kyc", { tier }),

  changePassword: (currentPassword, newPassword) =>
    patch("/users/change-password", { currentPassword, newPassword }),
};
