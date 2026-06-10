import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Summary = () => {
  const [holdings,  setHoldings]  = useState([]);
  const [positions, setPositions] = useState([]);
  const [orders,    setOrders]    = useState([]);
  const [funds,     setFunds]     = useState(null);

  const fetchAll = useCallback(() => {
    axios.get("/allHoldings").then((r)  => setHoldings(r.data)).catch(console.error);
    axios.get("/allPositions").then((r) => setPositions(r.data)).catch(console.error);
    axios.get("/allOrders").then((r)    => setOrders(r.data)).catch(console.error);
    axios.get("/funds").then((r)        => setFunds(r.data.equity)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchAll();
    window.addEventListener("orderPlaced", fetchAll);
    return () => window.removeEventListener("orderPlaced", fetchAll);
  }, [fetchAll]);

  const username      = localStorage.getItem("username") || "User";
  const totalInvested = holdings.reduce((s, h) => s + h.avg   * h.qty, 0);
  const currentVal    = holdings.reduce((s, h) => s + h.price * h.qty, 0);
  const holdingPnL    = currentVal - totalInvested;
  const holdingPct    = totalInvested > 0 ? ((holdingPnL / totalInvested) * 100).toFixed(2) : "0.00";
  const posPnL        = positions.reduce((s, p) => s + (p.price - p.avg) * p.qty, 0);
  const todayBuy      = orders.filter((o) => o.mode === "BUY").length;
  const todaySell     = orders.filter((o) => o.mode === "SELL").length;

  const marginAvailable = funds?.available ?? 0;
  const marginUsed      = funds?.usedMargin ?? 0;
  const openingBalance  = funds?.balance ?? 0;

  return (
    <div>
      <p className="page-title">Hi, {username} 👋</p>
      <hr className="divider" />

      {/* Summary Cards */}
      <div className="summary-grid">

        <div className="summary-card">
          <div className="card-label">Margin Available</div>
          <div className="card-value">₹{fmt(marginAvailable)}</div>
          <div className="card-sub">
            Opening: ₹{fmt(openingBalance)} &nbsp;·&nbsp; Used: ₹{fmt(marginUsed)}
          </div>
        </div>

        <div className="summary-card">
          <div className="card-label">Holdings P&amp;L</div>
          <div className={"card-value " + (holdingPnL >= 0 ? "profit" : "loss")}>
            {holdingPnL >= 0 ? "+" : ""}₹{fmt(holdingPnL)}
            <small style={{ fontSize: "0.85rem", marginLeft: 6 }}>
              ({holdingPnL >= 0 ? "+" : ""}{holdingPct}%)
            </small>
          </div>
          <div className="card-sub">
            Invested: ₹{fmt(totalInvested)} &nbsp;·&nbsp; Current: ₹{fmt(currentVal)}
          </div>
        </div>

        <div className="summary-card">
          <div className="card-label">Open Positions P&amp;L</div>
          <div className={"card-value " + (posPnL >= 0 ? "profit" : "loss")}>
            {posPnL >= 0 ? "+" : ""}₹{fmt(posPnL)}
          </div>
          <div className="card-sub">
            {positions.length} open position{positions.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="summary-card">
          <div className="card-label">Total Orders</div>
          <div className="card-value">{orders.length}</div>
          <div className="card-sub">
            <span className="profit">{todayBuy} buy</span>
            &nbsp;·&nbsp;
            <span className="loss">{todaySell} sell</span>
          </div>
        </div>

      </div>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <>
          <p className="page-title" style={{ marginTop: 24, marginBottom: 12 }}>
            Recent Orders
          </p>
          <table className="data-table" style={{ marginBottom: 24 }}>
            <thead>
              <tr>
                <th>Instrument</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o, i) => (
                <tr key={o._id || i}>
                  <td style={{ fontWeight: 600 }}>{o.name}</td>
                  <td>
                    <span className={"badge " + (o.mode === "BUY" ? "badge-buy" : "badge-sell")}>
                      {o.mode}
                    </span>
                  </td>
                  <td>{o.qty}</td>
                  <td>{o.price > 0 ? "₹" + Number(o.price).toLocaleString("en-IN") : "Market"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Summary;
