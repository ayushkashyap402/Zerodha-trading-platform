import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const NAV = [
  { label: "Dashboard",  to: "/"          },
  { label: "Orders",     to: "/orders"    },
  { label: "Holdings",   to: "/holdings"  },
  { label: "Positions",  to: "/positions" },
  { label: "Funds",      to: "/funds"     },
  { label: "Apps",       to: "/apps"      },
];

const Menu = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const username = user?.username || localStorage.getItem("username") || "User";
  const email    = user?.email    || localStorage.getItem("email")    || "";
  const initials = username.slice(0, 2).toUpperCase();

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const handleLogout = async () => {
    try { await axios.post("/logout"); } catch (_) {}
    localStorage.clear();
    window.location.href = "http://localhost:3000/login";
  };

  return (
    <div className="menu-container">
      <img src="logo.png" alt="logo" style={{ width: 44 }} />

      <div className="menus">
        <ul>
          {NAV.map((item) => (
            <li key={item.to}>
              <Link to={item.to} style={{ textDecoration: "none" }}>
                <span className={"menu" + (isActive(item.to) ? " selected" : "")}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="menu-divider" />

        {/* Profile avatar + dropdown */}
        <div
          className="profile"
          onClick={() => setOpen(!open)}
          style={{ position: "relative" }}
        >
          <div className={"avatar" + (isActive("/profile") ? " avatar-active" : "")}>
            {initials}
          </div>
          <span className="username">{username}</span>

          {open && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                background: "#fff", border: "1px solid #e8e8e8",
                borderRadius: 6, minWidth: 200,
                boxShadow: "0 6px 20px rgba(0,0,0,.12)", zIndex: 300,
              }}
            >
              {/* User info header */}
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg, #4184f3, #7c3aed)",
                  color: "#fff", fontWeight: 700, fontSize: "1rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 8,
                }}>
                  {initials}
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#222" }}>{username}</div>
                <div style={{ fontSize: "0.72rem", color: "#999", marginTop: 2 }}>{email}</div>
              </div>

              {/* Menu items */}
              <div style={{ padding: "6px 0" }}>
                <button
                  onClick={() => { navigate("/profile"); setOpen(false); }}
                  style={{
                    width: "100%", padding: "9px 16px", border: "none",
                    background: "none", textAlign: "left", cursor: "pointer",
                    fontSize: "0.82rem", color: "#333", display: "flex",
                    alignItems: "center", gap: 10,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <span style={{ fontSize: "1rem" }}>👤</span> View Profile
                </button>

                <button
                  onClick={() => { navigate("/funds"); setOpen(false); }}
                  style={{
                    width: "100%", padding: "9px 16px", border: "none",
                    background: "none", textAlign: "left", cursor: "pointer",
                    fontSize: "0.82rem", color: "#333", display: "flex",
                    alignItems: "center", gap: 10,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <span style={{ fontSize: "1rem" }}>💰</span> Funds
                </button>

                <div style={{ height: 1, background: "#f0f0f0", margin: "6px 0" }} />

                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%", padding: "9px 16px", border: "none",
                    background: "none", textAlign: "left", cursor: "pointer",
                    fontSize: "0.82rem", color: "#e74c3c", display: "flex",
                    alignItems: "center", gap: 10,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fff5f5"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <span style={{ fontSize: "1rem" }}>🚪</span> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
