import { useState, useEffect } from "react";
import { CSS } from "./tokens";
import { auth, clearToken } from "./utils/api";

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

const TRANSIENT = ["splash", "otp"];

export default function App() {
  const [page, setPage] = useState(() => {
    try {
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
  const [resetToken, setResetToken]   = useState(null);

  useEffect(() => {
    const restoreSession = async () => {
      const token = sessionStorage.getItem("vp_token");
      if (token && !user) {
        const { data, error } = await auth.me();
        if (data && !error) {
          setUser(data);
        } else {
          clearToken();
          setUser(null);
        }
      }
    };

    restoreSession();

    // Detect password-reset link: ?reset_token=...&reset_email=...
    const params = new URLSearchParams(window.location.search);
    const rt = params.get("reset_token");
    if (rt) {
      setResetToken(rt);
      // Clean the URL so the token isn't visible or reused
      window.history.replaceState({}, document.title, window.location.pathname);
      setPage("reset");
    }
  }, [user]);

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
  };

  // ── Back-button guard ──────────────────────────────────────────
  // When a user is logged in, intercept every popstate (browser Back/Forward)
  // and immediately re-push the current state, keeping them on the dashboard.
  useEffect(() => {
    if (!user) return; // only active while authenticated

    // Push a sentinel entry so there is always something to intercept.
    window.history.pushState({ spa: true }, "");

    const handlePop = () => {
      // Re-push so the browser "back" entry is never consumed.
      window.history.pushState({ spa: true }, "");
    };

    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [user]);
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
    user?.role === "provider" ? VendorDashboard : ClientDashboard;

  return (
    <>
      <style>{CSS}</style>
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
      {page === "reset"  && <ResetPasswordPage  token={resetToken} navigate={navigate} />}
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
