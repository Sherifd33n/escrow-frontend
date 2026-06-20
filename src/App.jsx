import { useState, useEffect } from "react";
import { CSS } from "./tokens";

import SplashScreen    from "./components/SplashScreen";
import HomePage        from "./pages/HomePage";
import LoginPage       from "./pages/LoginPage";
import SignupPage      from "./pages/SignupPage";
import OTPPage         from "./pages/OTPPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage   from "./pages/dashboard/DashboardPage";

// Pages that should never be the page you land on after a refresh —
// these are transient steps in a flow, not destinations.
const TRANSIENT_PAGES = ["splash", "otp"];

export default function App() {
  // On first load, restore the last page + user from sessionStorage (survives refresh,
  // clears when the browser tab actually closes — unlike localStorage).
  const [page, setPage] = useState(() => {
    try {
      const saved = sessionStorage.getItem("vp_page");
      if (saved && !TRANSIENT_PAGES.includes(saved)) return saved;
    } catch (e) {}
    return "splash";
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("vp_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [pendingUser, setPendingUser] = useState(null);

  // Keep sessionStorage in sync whenever page or user changes
  useEffect(() => {
    try { sessionStorage.setItem("vp_page", page); } catch (e) {}
  }, [page]);

  useEffect(() => {
    try {
      if (user) sessionStorage.setItem("vp_user", JSON.stringify(user));
      else sessionStorage.removeItem("vp_user");
    } catch (e) {}
  }, [user]);

  // If we restored "dashboard" from storage but somehow have no user
  // (e.g. storage was cleared), fall back to home instead of a blank page.
  useEffect(() => {
    if (page === "dashboard" && !user) setPage("home");
  }, []);

  const navigate = (p) => { setPage(p); window.scrollTo(0, 0); };

  // Signup → OTP → Dashboard
  const onSignupComplete = (u) => { setPendingUser(u); navigate("otp"); };
  const onOTPSuccess     = ()  => { setUser(pendingUser); setPendingUser(null); navigate("dashboard"); };

  // Login → Dashboard (no OTP in this flow)
  const onLoginSuccess   = (u) => { setUser(u); navigate("dashboard"); };

  const onLogout = () => {
    setUser(null);
    setPendingUser(null);
    try { sessionStorage.removeItem("vp_user"); } catch (e) {}
    navigate("home");
  };

  return (
    <>
      <style>{CSS}</style>

      {page === "splash"    && <SplashScreen onDone={() => navigate("home")} />}
      {page === "home"      && <HomePage navigate={navigate} />}
      {page === "login"     && <LoginPage onSuccess={onLoginSuccess} navigate={navigate} />}
      {page === "signup"    && <SignupPage onSuccess={onSignupComplete} navigate={navigate} />}
      {page === "otp"       && <OTPPage email={pendingUser?.email} onSuccess={onOTPSuccess} navigate={navigate} />}
      {page === "forgot"    && <ForgotPasswordPage navigate={navigate} />}
      {page === "dashboard" && user && <DashboardPage user={user} onLogout={onLogout} navigate={navigate} />}

      {/* Fallback — if dashboard but no user, go home */}
      {page === "dashboard" && !user && <HomePage navigate={navigate} />}
    </>
  );
}
