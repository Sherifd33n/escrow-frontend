/**
 * Escrow Platform — API Client
 * Place this file at:  src/utils/api.js
 *
 * All functions return { data, error }.
 * On success: data = response payload, error = null
 * On failure: data = null, error = string message
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Multipart form-data wrapper (for file uploads)
async function requestMultipart(method, path, formData) {
  const headers = {};
  const token = sessionStorage.getItem("vp_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: formData,
    });

    const json = await res.json().catch(() => ({}));

    if (res.status === 401) {
      clearToken();
      window.location.href = "/login";
      return {
        data: null,
        error: "Your session has expired. Please log in again.",
      };
    }

    if (res.status === 403) {
      return {
        data: null,
        error: "You don't have permission to perform this action.",
      };
    }

    if (!res.ok) {
      return {
        data: null,
        error: json.error || `Request failed (${res.status})`,
      };
    }

    return {
      data: json,
      error: null,
    };
  } catch (err) {
    console.error("API Request Error:", err);
    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : "Network error — is the server running?",
    };
  }
}

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

    // Session expired
    if (res.status === 401 && auth) {
      clearToken();

      window.location.href = "/login";

      return {
        data: null,
        error: "Your session has expired. Please log in again.",
      };
    }

    // Forbidden
    if (res.status === 403 && auth) {
      return {
        data: null,
        error: "You don't have permission to perform this action.",
      };
    }

    // Other errors
    if (!res.ok) {
      return {
        data: null,
        error: json.error || `Request failed (${res.status})`,
        unverified: json.unverified || false,
        user: json.user || null,
      };
    }

    // Success
    return {
      data: json,
      error: null,
    };
  } catch (err) {
    console.error("API Request Error:", err);

    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : "Network error — is the server running?",
    };
  }
}
const get = (path, auth) => request("GET", path, null, auth);
const post = (path, body, auth) => request("POST", path, body, auth);
const patch = (path, body, auth) => request("PATCH", path, body, auth);
const del = (path, auth) => request("DELETE", path, null, auth);

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

  login: (email, password) => post("/auth/login", { email, password }, false),

  verifyOTP: (userId, code) =>
    post("/auth/verify-otp", { userId, code }, false),

  resendOTP: (userId) => post("/auth/resend-otp", { userId }, false),

  forgotPassword: (email) => post("/auth/forgot-password", { email }, false),

  resetPassword: (token, newPassword) =>
    post("/auth/reset-password", { token, newPassword }, false),

  me: () => get("/auth/me"),
};

// ─── TRANSACTIONS ────────────────────────────────────────────────
export const transactions = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/transactions${qs ? "?" + qs : ""}`);
  },

  create: (data) => post("/transactions", data),

  get: (id) => get(`/transactions/${id}`),

  updateStatus: (id, status, ai_audit_note) =>
    patch(`/transactions/${id}/status`, { status, ai_audit_note }),

  addMilestone: (txnId, data) =>
    post(`/transactions/${txnId}/milestones`, data),

  updateMilestone: (milestoneId, data) =>
    patch(`/transactions/milestones/${milestoneId}/status`, data),

  payMilestone: (milestoneId) =>
    post(`/transactions/milestones/${milestoneId}/pay`),

  fileDispute: (id, data) => post(`/transactions/${id}/dispute`, data),

  getDispute: (id) => get(`/transactions/${id}/dispute`),

  resolveDispute: (id, data) => patch(`/transactions/${id}/dispute/resolve`, data),

  submitReview: (id, data) => post(`/transactions/${id}/review`, data),

  getReviews: (id) => get(`/transactions/${id}/review`),
};

// ─── ADMIN ───────────────────────────────────────────────────────
export const admin = {
  getDashboard: () => get("/admin/dashboard"),

  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/admin/transactions${qs ? "?" + qs : ""}`);
  },

  getUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/admin/users${qs ? "?" + qs : ""}`);
  },

  getDisputes: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/admin/disputes${qs ? "?" + qs : ""}`);
  },

  getDispute: (id) => get(`/admin/disputes/${id}`),

  reviewDispute: (id) => patch(`/admin/disputes/${id}/review`, {}),

  getReviews: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/admin/reviews${qs ? "?" + qs : ""}`);
  },

  deleteReview: (id) => del(`/admin/reviews/${id}`),
};

// ─── WALLET ──────────────────────────────────────────────────────
export const wallet = {
  get: () => get("/wallet"),

  deposit: (amount) => post("/wallet/deposit", { amount }),

  withdraw: (amount, bankId, accountNumber) =>
    post("/wallet/withdraw", { amount, bankId, accountNumber }),

  transfer: (amount, recipientEmail, note) =>
    post("/wallet/transfer", { amount, recipientEmail, note }),

  history: (page = 1) => get(`/wallet/history?page=${page}`),
};

// ─── EXCHANGE RATE ───────────────────────────────────────────────
export const exchangeRate = {
  get: () => get("/exchange-rate", false),
};

// ─── USERS ───────────────────────────────────────────────────────
export const users = {
  getProfile: () => get("/users/profile"),

  updateProfile: (data) => patch("/users/profile", data),

  updateKYC: (tier) => patch("/users/kyc", { tier }),

  submitKYC: (formData) =>
    requestMultipart("POST", "/users/kyc/submit", formData),

  getKYCStatus: () => get("/users/kyc/status"),

  getKYCQueue: () => get("/users/kyc/queue"),

  approveKYC: (id) => patch(`/users/kyc/approve/${id}`),

  rejectKYC: (id, reason) => patch(`/users/kyc/reject/${id}`, { reason }),

  sendPhoneOTP: (phone) => post("/users/phone/send-otp", { phone }),

  verifyPhoneOTP: (phone, code) => post("/users/phone/verify", { phone, code }),

  changePassword: (currentPassword, newPassword) =>
    patch("/users/change-password", { currentPassword, newPassword }),

  deleteAccount: () => del("/users/profile"),

  getSessions: () => get("/users/sessions"),

  revokeSession: (id) => del(`/users/sessions/${id}`),

  getReviews: (id) => get(`/users/${id}/reviews`),
};
