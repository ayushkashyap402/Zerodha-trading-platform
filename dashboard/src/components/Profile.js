import React, { useState, useEffect } from "react";
import axios from "axios";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Profile = () => {
  const [profile,  setProfile]  = useState(null);
  const [funds,    setFunds]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({});
  const [msg,      setMsg]      = useState({ text: "", ok: true });
  const [saving,   setSaving]   = useState(false);

  const fetchProfile = () => {
    Promise.all([
      axios.get("/profile"),
      axios.get("/funds"),
    ]).then(([pRes, fRes]) => {
      setProfile(pRes.data.user);
      setFunds(fRes.data.equity);
      setForm({
        username: pRes.data.user.username || "",
        phone:    pRes.data.user.phone    || "",
        pan:      pRes.data.user.pan      || "",
        dob:      pRes.data.user.dob      || "",
        address:  pRes.data.user.address  || "",
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg({ text: "", ok: true });
    try {
      const res = await axios.put("/profile", form);
      setProfile(res.data.user);
      localStorage.setItem("username", res.data.user.username);
      setEditing(false);
      setMsg({ text: "Profile updated successfully!", ok: true });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Update failed", ok: false });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="empty-state"><p>Loading profile…</p></div>;
  }

  const initials  = (profile?.username || "U").slice(0, 2).toUpperCase();
  const joinDate  = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <div>
      <p className="page-title">Profile</p>
      <hr className="divider" />

      {msg.text && (
        <div style={{
          padding: "10px 16px", marginBottom: 16, borderRadius: 4,
          background: msg.ok ? "#e8f5e9" : "#fde8e8",
          color: msg.ok ? "#27ae60" : "#e74c3c",
          fontSize: "0.85rem", fontWeight: 500,
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>

        {/* ── Left: Avatar + stats ─────────────────────────────────────── */}
        <div>
          {/* Avatar card */}
          <div style={{
            background: "#fff", border: "1px solid #ebebeb", borderRadius: 8,
            padding: "28px 20px", textAlign: "center", marginBottom: 16,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg, #4184f3, #7c3aed)",
              color: "#fff", fontSize: "1.6rem", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              {initials}
            </div>
            <div style={{ fontWeight: 700, fontSize: "1rem", color: "#222" }}>
              {profile?.username}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#999", marginTop: 4 }}>
              {profile?.email}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#bbb", marginTop: 6 }}>
              Member since {joinDate}
            </div>
          </div>

          {/* Account stats */}
          <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 8, overflow: "hidden" }}>
            {[
              { label: "Account Balance",  value: `₹${fmt(funds?.balance ?? 0)}`,    color: "#333" },
              { label: "Available Margin", value: `₹${fmt(funds?.available ?? 0)}`,  color: "#27ae60" },
              { label: "Used Margin",      value: `₹${fmt(funds?.usedMargin ?? 0)}`, color: funds?.usedMargin > 0 ? "#e74c3c" : "#333" },
              { label: "Invested",         value: `₹${fmt(funds?.invested ?? 0)}`,   color: "#4184f3" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", borderBottom: "1px solid #f5f5f5",
              }}>
                <span style={{ fontSize: "0.78rem", color: "#888" }}>{label}</span>
                <span style={{ fontSize: "0.88rem", fontWeight: 600, color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Details form ──────────────────────────────────────── */}
        <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 8, padding: "24px 28px" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "#333" }}>Personal Details</p>
            {!editing ? (
              <button onClick={() => setEditing(true)} style={{
                padding: "6px 16px", background: "#4184f3", color: "#fff",
                border: "none", borderRadius: 3, fontSize: "0.8rem", cursor: "pointer",
              }}>
                Edit
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleSave} disabled={saving} style={{
                  padding: "6px 16px", background: "#27ae60", color: "#fff",
                  border: "none", borderRadius: 3, fontSize: "0.8rem", cursor: "pointer",
                }}>
                  {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => { setEditing(false); setMsg({ text: "", ok: true }); }} style={{
                  padding: "6px 14px", background: "#fff", color: "#666",
                  border: "1px solid #ddd", borderRadius: 3, fontSize: "0.8rem", cursor: "pointer",
                }}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 24px" }}>
            {[
              { key: "username", label: "Full Name",     type: "text",     placeholder: "Your full name" },
              { key: "phone",    label: "Phone Number",  type: "tel",      placeholder: "+91 XXXXX XXXXX" },
              { key: "pan",      label: "PAN Number",    type: "text",     placeholder: "ABCDE1234F" },
              { key: "dob",      label: "Date of Birth", type: "date",     placeholder: "" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <div style={{ fontSize: "0.72rem", color: "#999", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {label}
                </div>
                {editing ? (
                  <input
                    type={type}
                    value={form[key] || ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{
                      width: "100%", padding: "8px 10px",
                      border: "1px solid #ddd", borderRadius: 3,
                      fontSize: "0.88rem", outline: "none",
                    }}
                  />
                ) : (
                  <div style={{ fontSize: "0.9rem", color: profile?.[key] ? "#333" : "#bbb", fontWeight: profile?.[key] ? 500 : 400 }}>
                    {profile?.[key] || "Not set"}
                  </div>
                )}
              </div>
            ))}

            {/* Address — full width */}
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "0.72rem", color: "#999", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Address
              </div>
              {editing ? (
                <textarea
                  value={form.address || ""}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Your full address"
                  rows={3}
                  style={{
                    width: "100%", padding: "8px 10px",
                    border: "1px solid #ddd", borderRadius: 3,
                    fontSize: "0.88rem", resize: "vertical", outline: "none",
                  }}
                />
              ) : (
                <div style={{ fontSize: "0.9rem", color: profile?.address ? "#333" : "#bbb", fontWeight: profile?.address ? 500 : 400 }}>
                  {profile?.address || "Not set"}
                </div>
              )}
            </div>
          </div>

          <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid #f0f0f0" }} />

          {/* Read-only fields */}
          <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "#333", marginBottom: 16 }}>Account Info</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
            {[
              { label: "Email",       value: profile?.email },
              { label: "Member Since",value: joinDate },
              { label: "Account ID",  value: profile?._id?.slice(-8).toUpperCase() },
              { label: "Account Type",value: "Individual" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: "0.72rem", color: "#999", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {label}
                </div>
                <div style={{ fontSize: "0.88rem", color: "#555", fontWeight: 500 }}>{value || "—"}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
