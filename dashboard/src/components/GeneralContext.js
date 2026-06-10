import React, { useState, useEffect } from "react";
import axios from "axios";

const GeneralContext = React.createContext({
  openBuyWindow:  (uid, price) => {},
  openSellWindow: (uid, price) => {},
  closeBuyWindow:  () => {},
  closeSellWindow: () => {},
});

export const GeneralContextProvider = ({ children }) => {
  const [buyOpen,    setBuyOpen]    = useState(false);
  const [sellOpen,   setSellOpen]   = useState(false);
  const [stockName,  setStockName]  = useState("");
  const [stockPrice, setStockPrice] = useState(0);

  const openBuyWindow  = (name, price = 0) => {
    setStockName(name); setStockPrice(price);
    setBuyOpen(true); setSellOpen(false);
  };
  const openSellWindow = (name, price = 0) => {
    setStockName(name); setStockPrice(price);
    setSellOpen(true); setBuyOpen(false);
  };
  const closeBuyWindow  = () => setBuyOpen(false);
  const closeSellWindow = () => setSellOpen(false);

  return (
    <GeneralContext.Provider value={{ openBuyWindow, openSellWindow, closeBuyWindow, closeSellWindow }}>
      {children}
      {buyOpen  && (
        <OrderWindow
          uid={stockName} defaultPrice={stockPrice} mode="BUY"
          onClose={closeBuyWindow}
        />
      )}
      {sellOpen && (
        <OrderWindow
          uid={stockName} defaultPrice={stockPrice} mode="SELL"
          onClose={closeSellWindow}
        />
      )}
    </GeneralContext.Provider>
  );
};

// ── Order Window ─────────────────────────────────────────────────────────────
const OrderWindow = ({ uid, defaultPrice, mode, onClose }) => {
  const [qty,       setQty]       = useState(1);
  const [price,     setPrice]     = useState(defaultPrice > 0 ? String(defaultPrice) : "");
  const [orderType, setOrderType] = useState("LIMIT");
  const [loading,   setLoading]   = useState(false);
  const [msg,       setMsg]       = useState({ text: "", ok: true });
  const [balance,   setBalance]   = useState(null);

  // Fetch current available balance when window opens
  React.useEffect(() => {
    axios.get("/funds")
      .then((r) => setBalance(r.data.equity?.available ?? 0))
      .catch(() => {});
  }, []);

  const isBuy      = mode === "BUY";
  const headerCls  = isBuy ? "window-header buy-header"  : "window-header sell-header";
  const submitCls  = isBuy ? "btn-buy-submit"            : "btn-sell-submit";
  const orderPrice = orderType === "MARKET" ? defaultPrice : Number(price);
  const totalValue = (Number(qty) * orderPrice) || 0;

  const handleSubmit = async () => {
    if (!qty || Number(qty) <= 0) { setMsg({ text: "Quantity must be > 0", ok: false }); return; }
    if (orderType === "LIMIT" && (!price || Number(price) <= 0)) {
      setMsg({ text: "Enter a valid price", ok: false }); return;
    }

    setLoading(true);
    setMsg({ text: "", ok: true });
    try {
      await axios.post("/newOrder", {
        name:  uid,
        qty:   Number(qty),
        price: orderPrice,
        mode,
      });
      setMsg({ text: "✓ Order placed!", ok: true });
      window.dispatchEvent(new CustomEvent("orderPlaced"));
      setTimeout(onClose, 900);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Order failed. Try again.";
      setMsg({ text: errMsg, ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id={isBuy ? "buy-window" : "sell-window"}>
      {/* Header */}
      <div className={headerCls}>
        <div>
          <h4 style={{ margin: 0, fontSize: "0.95rem" }}>{mode}: {uid}</h4>
          {defaultPrice > 0 && (
            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.8)" }}>
              LTP: ₹{defaultPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Order type tabs */}
      <div className="order-type-tabs">
        {["MARKET", "LIMIT"].map((t) => (
          <button key={t} className={orderType === t ? "active" : ""}
            onClick={() => setOrderType(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="window-body">
        <div className="input-row">
          <div className="input-field">
            <label>Qty.</label>
            <input type="number" min="1" value={qty}
              onChange={(e) => setQty(e.target.value)} />
          </div>
          <div className="input-field">
            <label>Price {orderType === "MARKET" ? "(Market)" : "(₹)"}</label>
            <input type="number" step="0.05"
              placeholder={orderType === "MARKET" ? "Market price" : "0.00"}
              disabled={orderType === "MARKET"}
              value={orderType === "MARKET" ? "" : price}
              onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>

        {/* Order summary */}
        <div className="order-meta">
          <span>
            Est. value:{" "}
            <strong>₹{totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </span>
          {balance !== null && (
            <span style={{ fontSize: "0.72rem", color: "#888" }}>
              Available: <strong style={{ color: totalValue > balance ? "#e74c3c" : "#27ae60" }}>
                ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </strong>
            </span>
          )}
        </div>
        {msg.text && (
          <div style={{
            padding: "8px 12px", marginTop: 8, borderRadius: 3,
            background: msg.ok ? "#e8f5e9" : "#fde8e8",
            color: msg.ok ? "#27ae60" : "#e74c3c",
            fontSize: "0.8rem", fontWeight: 500,
          }}>
            {msg.text}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="window-footer">
        <button className="btn-cancel" onClick={onClose}>Cancel</button>
        <button className={submitCls} onClick={handleSubmit} disabled={loading}>
          {loading ? "Placing…" : `${mode} →`}
        </button>
      </div>
    </div>
  );
};

export default GeneralContext;
