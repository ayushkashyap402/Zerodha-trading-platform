import React, { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import TopBar    from "./TopBar";

const FRONTEND_URL = "http://localhost:3000";

// ── Axios global setup ────────────────────────────────────────────────────────
axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.replace(`${FRONTEND_URL}/login`);
    }
    return Promise.reject(err);
  }
);

// ── Component ─────────────────────────────────────────────────────────────────
const Home = () => {
  const [status, setStatus] = useState("checking");
  const [user,   setUser]   = useState(null);

  useEffect(() => {
    // ── Step 1: Check if token arrived via URL params (cross-origin handoff) ──
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken    = urlParams.get("token");
    const urlUserId   = urlParams.get("userId");
    const urlUsername = urlParams.get("username");
    const urlEmail    = urlParams.get("email");

    if (urlToken && urlUserId) {
      // Save to this origin's localStorage
      localStorage.setItem("token",    urlToken);
      localStorage.setItem("userId",   urlUserId);
      localStorage.setItem("username", urlUsername || "");
      localStorage.setItem("email",    urlEmail    || "");
      // Clean URL — remove params so they don't stay in browser history
      window.history.replaceState({}, document.title, "/");
    }

    // ── Step 2: Read from localStorage (now guaranteed to exist if just set) ──
    const token  = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      window.location.replace(`${FRONTEND_URL}/login`);
      return;
    }

    // ── Step 3: Verify token with backend ──────────────────────────────────
    axios.get("/me")
      .then((res) => {
        if (res.data.success) {
          const u = res.data.user;
          setUser({
            userId:   u._id,
            username: u.username,
            email:    u.email,
            balance:  u.balance,
          });
          localStorage.setItem("username", u.username);
          localStorage.setItem("email",    u.email);
          setStatus("ok");
        } else {
          throw new Error("Invalid session");
        }
      })
      .catch(() => {
        localStorage.clear();
        window.location.replace(`${FRONTEND_URL}/login`);
      });
  }, []);

  // ── Loading spinner ─────────────────────────────────────────────────────────
  if (status === "checking") {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: "100vh", gap: 14, color: "#888", fontFamily: "sans-serif",
      }}>
        <div style={{
          width: 36, height: 36,
          border: "3px solid #eee",
          borderTop: "3px solid #387ed1",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <span style={{ fontSize: "0.88rem" }}>Loading your dashboard…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <TopBar user={user} />
      <Dashboard />
    </>
  );
};

export default Home;
