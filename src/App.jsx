import { useState, useEffect, useRef } from "react";
import { CSS } from "./tokens";
import { auth, clearToken } from "./utils/api";
import { useSSE } from "./utils/useSSE";
import { usePushNotifications } from "./utils/usePushNotifications";

import SplashScreen from "./components/SplashScreen";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OTPPage from "./pages/OTPPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import VendorDashboard from "./pages/dashboard/VendorDashboard";
import ServicesPage from "./pages/servicesPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import AdminPanel from "./components/dashboard/AdminPanel";
import PaystackCallback from "./pages/PaystackCallback";

const TRANSIENT = ["splash", "otp"];

export default function App() {
  const [resetToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("reset_token") || null;
  });

  const [page, setPage] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reset_token")) return "reset";
      if (params.get("trxref") || params.get("reference")) return "paystack_callback";
      const s = sessionStorage.getItem("vp_page");
      if (s && !TRANSIENT.includes(s)) return s;
    } catch (error) {
      console.error("Failed to read vp_page:", error);
    }
    return "splash";
  });


  const [user, setUser] = useState(() => {
    try {
      const s = sessionStorage.getItem("vp_user");
      return s ? JSON.parse(s) : null;
    } catch (error) {
      console.error("Failed to read vp_user:", error);
      return null;
    }
  });

  const [pendingUser, setPendingUser] = useState(null);

  // ── SSE: connect once per logged-in user ──────────────────────────────────
  useSSE(user);

  // ── WebPush: Register Service Worker and subscribe user for background push notifications
  usePushNotifications(user);

  useEffect(() => {
    // Clean URL if reset_token query parameter was present
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset_token")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const token = sessionStorage.getItem("vp_token");
      if (token) {
        const { data, error } = await auth.me();
        if (data && !error) {
          setUser(data);
        } else if (!user) {
          clearToken();
          setUser(null);
        }
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("vp_page", page);
    } catch (error) {
      console.error("Session storage error:", error);
    }
  }, [page]);

  useEffect(() => {
    try {
      if (user) sessionStorage.setItem("vp_user", JSON.stringify(user));
      else sessionStorage.removeItem("vp_user");
    } catch (error) {
      console.error("Session storage error:", error);
    }
  }, [user]);

  const navigate = (p) => {
    setPage(p);
    window.scrollTo(0, 0);
    if (userRef.current) {
      window.history.pushState({ spa: true }, "", window.location.href);
    }
  };

  // ── Back-button guard ──────────────────────────────────────────
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
    if (user) {
      window.history.pushState({ spa: true }, "", window.location.href);
    }
  }, [user]);

  useEffect(() => {
    const handlePop = () => {
      if (userRef.current) {
        window.history.pushState({ spa: true }, "", window.location.href);
        setPage("dashboard");
      }
    };

    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);
  // ──────────────────────────────────────────────────────────────

  const onLoginSuccess = (u) => {
    setUser(u);
    navigate("dashboard");
  };
  const onSignupSuccess = (u) => {
    setPendingUser(u);
    navigate("otp");
  };
  const onOTPSuccess = (u) => {
    setUser(u || pendingUser);
    setPendingUser(null);
    navigate("dashboard");
  };
  const onLogout = () => {
    clearToken();
    setUser(null);
    navigate("home");
  };

  const Dashboard =
    user?.role === "admin"
      ? AdminPanel
      : user?.role === "provider"
        ? VendorDashboard
        : ClientDashboard;

  return (
    <>
      <style>{CSS}</style>
      {/* Impersonation Banner (Commented out)
      {sessionStorage.getItem("vp_admin_token") && (
        <div
          style={{
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            color: "#fff",
            padding: "9px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 13,
            position: "sticky",
            top: 0,
            zIndex: 9999,
            boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>👁️</span>
            <span>
              <strong>Impersonation Mode:</strong> Currently viewing as{" "}
              <strong>{user?.name || "User"}</strong> ({user?.email}) · Role:{" "}
              <span style={{ textTransform: "capitalize" }}>{user?.role || "Client"}</span>
            </span>
          </div>
          <button
            onClick={() => {
              const adminTok = sessionStorage.getItem("vp_admin_token");
              const adminUsr = sessionStorage.getItem("vp_admin_user");
              sessionStorage.setItem("vp_token", adminTok);
              if (adminUsr) sessionStorage.setItem("vp_user", adminUsr);
              sessionStorage.removeItem("vp_admin_token");
              sessionStorage.removeItem("vp_admin_user");
              sessionStorage.setItem("vp_role", "admin");
              window.location.replace("/");
            }}
            style={{
              background: "#fff",
              color: "#4f46e5",
              border: "none",
              padding: "5px 14px",
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
            }}
          >
            ← Return to Admin Panel
          </button>
        </div>
      )}
      */}
      {page === "splash" && <SplashScreen onDone={() => navigate("home")} />}
      {page === "home" && (
        <HomePage navigate={navigate} user={user} onLogout={onLogout} />
      )}
      {page === "login" && (
        <LoginPage
          onSuccess={onLoginSuccess}
          setPendingUser={setPendingUser}
          navigate={navigate}
        />
      )}
      {page === "signup" && (
        <SignupPage onSuccess={onSignupSuccess} navigate={navigate} />
      )}
      {page === "otp" && (
        <OTPPage
          pendingUser={pendingUser}
          onSuccess={onOTPSuccess}
          navigate={navigate}
        />
      )}
      {page === "forgot" && <ForgotPasswordPage navigate={navigate} />}
      {page === "reset" && (
        <ResetPasswordPage token={resetToken} navigate={navigate} />
      )}
      {page === "paystack_callback" && (
        <PaystackCallback navigate={navigate} />
      )}
      {page === "services" && <ServicesPage navigate={navigate} user={user} />}

      {page === "subscription" && (
        <SubscriptionPage navigate={navigate} user={user} />
      )}
      {page === "dashboard" && user && (
        <Dashboard
          user={user}
          onLogout={onLogout}
          navigate={navigate}
          onUserUpdate={setUser}
        />
      )}
      {page === "dashboard" && !user && <HomePage navigate={navigate} />}
    </>
  );
}
