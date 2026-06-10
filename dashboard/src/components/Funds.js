import React, { useState, useEffect } from "react";
import axios from "axios";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Funds = () => {
  const [equity,   setEquity]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [showWith, setShowWith] = useState(false);
  const [amount,   setAmount]   = useState("");
  const [msg,      setMsg]      = useState({ text: "", ok: true });
  const [submitting, setSubmitting] = useState(false);

  const fetchFunds = () => {
    setLoading(true);
    axios.get("/funds")
      .then((r) => { setEquity(r.data.equity); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchFunds(); }, []);

  const handleTransaction = async (type) => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { setMsg({ text: "Enter a valid amount", ok: false }); return; }

    setSubmitting(true);
    setMsg({ text: "", ok: true });
    try {
      const res = await axios.post(`/funds/${type}`, { amount: amt });
      setMsg({ text: res.data.message, ok: true });
      setAmount("");
      setShowAdd(false);
      setShowWith(false);
      fetchFunds();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Transaction failed", ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <p className="page-title">Funds</p>
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

      <div className="funds-grid">

        {/* Equity Card */}
        <div className="funds-card">
          <h3>Equity</h3>

          {loading ? (
            <p style={{ color: "#aaa", fontSize: "0.85rem" }}>Loading…</p>
          ) : (
            <>
              {[
                ["Available margin",  fmt(equity?.available ?? 0)],
                ["Used margin",       fmt(equity?.usedMargin ?? 0)],
                ["Opening balance",   fmt(equity?.balance ?? 0)],
                ["Invested in stocks",fmt(equity?.invested ?? 0)],
                ["SPAN",              "₹0.00"],
                ["Delivery margin",   "₹0.00"],
                ["Exposure",          "₹0.00"],
              ].map(([l, v]) => (
                <div className="funds-row" key={l}>
                  <span className="fl">{l}</span>
                  <span className="fv">
                    {l === "Available margin" || l === "Opening balance" || l === "Used margin" || l === "Invested in stocks"
                      ? `₹${v}` : v}
                  </span>
                </div>
              ))}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button className="funds-add-btn" onClick={() => { setShowAdd(true); setShowWith(false); setMsg({ text: "", ok: true }); }}>
                  + Add Funds
                </button>
                <button
                  onClick={() => { setShowWith(true); setShowAdd(false); setMsg({ text: "", ok: true }); }}
                  style={{
                    marginTop: 0, padding: "8px 18px", background: "#fff",
                    color: "#e74c3c", border: "1px solid #e74c3c",
                    borderRadius: 3, fontSize: "0.82rem", cursor: "pointer",
                  }}
                >
                  Withdraw
                </button>
              </div>

              {/* Add funds form */}
              {showAdd && (
                <div style={{ marginTop: 16, padding: "14px", background: "#f9f9f9", borderRadius: 4, border: "1px solid #eee" }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 8 }}>Add Funds</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="number" min="1" placeholder="Amount (₹)"
                      value={amount} onChange={(e) => setAmount(e.target.value)}
                      style={{ flex: 1, padding: "8px 10px", border: "1px solid #ddd", borderRadius: 3, fontSize: "0.9rem" }}
                    />
                    <button className="funds-add-btn" style={{ marginTop: 0 }}
                      onClick={() => handleTransaction("add")} disabled={submitting}>
                      {submitting ? "…" : "Add"}
                    </button>
                    <button onClick={() => setShowAdd(false)}
                      style={{ padding: "8px 12px", background: "#fff", border: "1px solid #ddd", borderRadius: 3, cursor: "pointer", fontSize: "0.82rem" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Withdraw form */}
              {showWith && (
                <div style={{ marginTop: 16, padding: "14px", background: "#fff5f5", borderRadius: 4, border: "1px solid #fde8e8" }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 8, color: "#e74c3c" }}>
                    Withdraw Funds &nbsp;
                    <span style={{ fontWeight: 400, color: "#888" }}>
                      (Available: ₹{fmt(equity?.available ?? 0)})
                    </span>
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="number" min="1" placeholder="Amount (₹)"
                      value={amount} onChange={(e) => setAmount(e.target.value)}
                      style={{ flex: 1, padding: "8px 10px", border: "1px solid #f5c6c6", borderRadius: 3, fontSize: "0.9rem" }}
                    />
                    <button
                      onClick={() => handleTransaction("withdraw")} disabled={submitting}
                      style={{ padding: "8px 14px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: 3, cursor: "pointer", fontSize: "0.82rem" }}>
                      {submitting ? "…" : "Withdraw"}
                    </button>
                    <button onClick={() => setShowWith(false)}
                      style={{ padding: "8px 12px", background: "#fff", border: "1px solid #ddd", borderRadius: 3, cursor: "pointer", fontSize: "0.82rem" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Commodity Card */}
        <div className="funds-card">
          <h3>Commodity</h3>
          {[
            ["Available margin", "₹0.00"],
            ["Used margin",      "₹0.00"],
            ["Opening balance",  "₹0.00"],
            ["SPAN",             "₹0.00"],
            ["Exposure",         "₹0.00"],
          ].map(([l, v]) => (
            <div className="funds-row" key={l}>
              <span className="fl">{l}</span>
              <span className="fv">{v}</span>
            </div>
          ))}
          <button className="funds-add-btn" style={{ opacity: 0.5, cursor: "not-allowed" }} disabled>
            + Add Funds
          </button>
        </div>

      </div>
    </div>
  );
};

export default Funds;
