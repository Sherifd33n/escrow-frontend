/**
 * Escrow Platform — API Client
 * Place this file at:  src/utils/api.js
 *
 * All functions return { data, error }.
 * On success: data = response payload, error = null
 * On failure: data = null, error = string message
 */

const BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:4000/api"
).replace(/\/+$/, "");

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
      sessionStorage.setItem("vp_page", "login");
      window.location.replace("/");
      return {
        data: null,
        error: "Your session has expired. Please log in again.",
      };
    }

    if (res.status === 403) {
      return {
        data: null,
        error: json.error || "You don't have permission to perform this action.",
        code: json.code,
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
      sessionStorage.setItem("vp_page", "login");
      window.location.replace("/");

      return {
        data: null,
        error: "Your session has expired. Please log in again.",
      };
    }

    // Forbidden
    if (res.status === 403 && auth) {
      return {
        data: null,
        error: json.error || "You don't have permission to perform this action.",
        code: json.code,
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

  verify2FA: (userId, code) =>
    post("/auth/verify-2fa", { userId, code }, false),

  resendOTP: (userId) => post("/auth/resend-otp", { userId }, false),

  forgotPassword: (email) => post("/auth/forgot-password", { email }, false),

  resetPassword: (token, newPassword) =>
    post("/auth/reset-password", { token, newPassword }, false),

  me: () => get("/auth/me"),

  logout: async () => {
    try {
      await post("/auth/logout", {});
    } catch (e) {
      console.warn("Server logout notification skipped:", e.message);
    } finally {
      clearToken();
    }
  },
};

// ─── TRANSACTIONS ────────────────────────────────────────────────
export const transactions = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/transactions${qs ? "?" + qs : ""}`);
  },

  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/transactions${qs ? "?" + qs : ""}`);
  },

  create: (data) => post("/transactions", data),

  get: (id) => get(`/transactions/${id}`),

  cancel: (id, reason) => post(`/transactions/${id}/cancel`, { reason }),

  updateStatus: (id, status, extraBody = {}) =>
    patch(`/transactions/${id}/status`, { status, ...extraBody }),

  addMilestone: (txnId, data) =>
    post(`/transactions/${txnId}/milestones`, data),

  updateMilestone: (milestoneId, data) =>
    patch(`/transactions/milestones/${milestoneId}/status`, data),

  // Convenience wrapper used by dashboards: PATCH /milestones/:id/status { status, reason, details, deliverable_note }
  updateMilestoneStatus: (milestoneId, status, extraBody = {}) =>
    patch(`/transactions/milestones/${milestoneId}/status`, { status, ...extraBody }),

  payMilestone: (milestoneId) =>
    post(`/transactions/milestones/${milestoneId}/pay`),

  fileDispute: (id, data) => post(`/transactions/${id}/dispute`, data),

  getDispute: (id) => get(`/transactions/${id}/dispute`),

  resolveDispute: (id, data) =>
    patch(`/transactions/${id}/dispute/resolve`, data),

  getHistory: (id) => get(`/transactions/${id}/history`),

  submitReview: (id, data) => post(`/transactions/${id}/review`, data),

  getReviews: (id) => get(`/transactions/${id}/review`),

  // Attach or update confirmed AI scope on an existing transaction (buyer only)
  confirmScope: (id, data) => patch(`/transactions/${id}/scope`, data),

  // Provider requests contract changes from client before starting work
  requestScopeChanges: (id, message) => post(`/transactions/${id}/scope/request-changes`, { message }),

  // Upload a file as submission evidence — returns { url, original_name, size, mime_type }
  uploadEvidenceFile: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return requestMultipart("POST", "/transactions/evidence/upload", fd);
  },
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

  resolveDispute: (id, data) => patch(`/admin/disputes/${id}/resolve`, data),

  getReviews: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/admin/reviews${qs ? "?" + qs : ""}`);
  },

  deleteReview: (id) => del(`/admin/reviews/${id}`),
};

// ─── WALLET ──────────────────────────────────────────────────────
export const wallet = {
  get: () => get("/wallet"),

  deposit: (amount) => post("/payments/initialize", { amount }),

  withdraw: (amount, bankAccountId) =>
    post("/withdrawals", { amount, bankAccountId }),

  transfer: (amount, recipientEmail, note) =>
    post("/wallet/transfer", { amount, recipientEmail, note }),

  history: (page = 1) => get(`/wallet/history?page=${page}`),
};

// ─── PAYMENTS (Paystack) ─────────────────────────────────────────
export const payments = {
  initialize: (amount) => post("/payments/initialize", { amount }),

  verify: (reference) => get(`/payments/verify/${encodeURIComponent(reference)}`),

  history: (page = 1) => get(`/payments/history?page=${page}`),
};

// ─── BANK ACCOUNTS ───────────────────────────────────────────────
export const bankAccounts = {
  getBanks: () => get("/bank-accounts/banks"),

  resolve: (accountNumber, bankCode) =>
    get(`/bank-accounts/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`),

  save: (bankName, bankCode, accountNumber) =>
    post("/bank-accounts", { bankName, bankCode, accountNumber }),

  list: () => get("/bank-accounts"),

  setDefault: (id) => patch(`/bank-accounts/${id}/default`, {}),

  remove: (id) => del(`/bank-accounts/${id}`),
};

// ─── WITHDRAWALS ─────────────────────────────────────────────────
export const withdrawals = {
  request: (amount, bankAccountId) =>
    post("/withdrawals", { amount, bankAccountId }),

  list: (page = 1) => get(`/withdrawals?page=${page}`),
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

  resetKYC: () => post("/users/kyc/reset"),

  getKYCQueue: () => get("/users/kyc/queue"),

  approveKYC: (id) => patch(`/users/kyc/approve/${id}`),

  rejectKYC: (id, reason) => patch(`/users/kyc/reject/${id}`, { reason }),

  sendPhoneOTP: (phone) => post("/users/phone/send-otp", { phone }),

  verifyPhoneOTP: (phone, code) => post("/users/phone/verify", { phone, code }),

  verifyPortfolio: (url) => post("/users/portfolio/verify", { url }),

  send2FAOTP: () => post("/users/2fa/send-otp"),

  enable2FA: (code) => post("/users/2fa/enable", { code }),

  disable2FA: (password) => post("/users/2fa/disable", { password }),

  changePassword: (currentPassword, newPassword) =>
    patch("/users/change-password", { currentPassword, newPassword }),

  deleteAccount: () => del("/users/profile"),

  getSessions: () => get("/users/sessions"),

  revokeSession: (id) => del(`/users/sessions/${id}`),

  getReviews: (id) => get(`/users/${id}/reviews`),
};

// ─── SUBSCRIPTIONS ───────────────────────────────────────────────
export const subscriptions = {
  getPlans: () => get("/subscriptions/plans", false),
  getCurrent: () => get("/subscriptions/current"),
  getEntitlements: () => get("/subscriptions/entitlements"),

  /**
   * Initialise a Paystack payment for a subscription plan.
   * Returns { authorization_url, reference, planId, billingCycle, amountUsd, amountNgn }.
   * Frontend should redirect the user to authorization_url.
   */
  initiatePayment: (planId, billingCycle) =>
    post("/subscriptions/initiate-payment", { planId, billingCycle }),

  /**
   * Verify a subscription payment reference and activate the plan.
   * Called after Paystack redirects back with a reference.
   */
  verifyPayment: (reference) =>
    post(`/subscriptions/verify-payment/${encodeURIComponent(reference)}`),

  cancel: () => post("/subscriptions/cancel"),
  cancelPendingDowngrade: () => post("/subscriptions/cancel-pending-downgrade"),
};

// ─── AI SERVICES ────────────────────────────────────────────────
export const ai = {
  generateScope: (categoryLabel, description, transactionId) =>
    post("/ai/scope", { categoryLabel, description, transactionId }),
  runAudit: (data) => post("/ai/audit", data),
  getAudits: (transactionId) => get(`/ai/audits/${transactionId}`),
};

// ─── REAL-TIME NOTIFICATIONS (SSE) ───────────────────────────────
export function connectNotificationStream(onNotification) {
  const token = sessionStorage.getItem("vp_token");

  if (!token) return null;

  const streamUrl = `${BASE}/notifications/stream?token=${encodeURIComponent(token)}`;

  const eventSource = new EventSource(streamUrl);

  eventSource.addEventListener("notification", (event) => {
    try {
      const notification = JSON.parse(event.data);
      onNotification(notification);
    } catch (err) {
      console.error("Failed to parse notification:", err);
    }
  });

  eventSource.onerror = (err) => {
    console.error("Notification stream disconnected.", err);
  };

  return eventSource;
}
