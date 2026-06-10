import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";

const fmt = (n) =>
  Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [loading,     setLoading]     = useState(true);

  const fetchHoldings = useCallback(() => {
    setLoading(true);
    axios.get("/allHoldings")
      .then((res) => { setAllHoldings(res.data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  useEffect(() => {
    fetchHoldings();
    // Refresh whenever an order is placed from the order window
    window.addEventListener("orderPlaced", fetchHoldings);
    return () => window.removeEventListener("orderPlaced", fetchHoldings);
  }, [fetchHoldings]);

  const totalInvestment = allHoldings.reduce((s, h) => s + h.avg   * h.qty, 0);
  const currentValue    = allHoldings.reduce((s, h) => s + h.price * h.qty, 0);
  const totalPnL        = currentValue - totalInvestment;
  const pnlPct          = totalInvestment > 0
    ? ((totalPnL / totalInvestment) * 100).toFixed(2)
    : "0.00";

  const chartData = {
    labels: allHoldings.map((h) => h.name),
    datasets: [{
      label: "LTP (₹)",
      data:  allHoldings.map((h) => h.price),
      backgroundColor: "rgba(65,132,243,0.55)",
      borderColor:     "rgba(65,132,243,1)",
      borderWidth: 1,
    }],
  };

  return (
    <div>
      <div className="section-header">
        <p className="page-title">Holdings ({allHoldings.length})</p>
        {allHoldings.length > 0 && (
          <span style={{ fontSize: "0.82rem" }} className={totalPnL >= 0 ? "profit" : "loss"}>
            Overall P&amp;L: {totalPnL >= 0 ? "+" : ""}₹{fmt(totalPnL)} ({totalPnL >= 0 ? "+" : ""}{pnlPct}%)
          </span>
        )}
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading holdings…</p></div>
      ) : allHoldings.length === 0 ? (
        <div className="empty-state">
          <p>No holdings yet.</p>
          <p style={{ fontSize: "0.8rem" }}>Buy stocks from the watchlist to see them here.</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Qty</th>
                  <th>Avg Cost</th>
                  <th>LTP</th>
                  <th>Cur. Value</th>
                  <th>P&amp;L</th>
                  <th>Net Chg.</th>
                  <th>Day Chg.</th>
                </tr>
              </thead>
              <tbody>
                {allHoldings.map((stock, i) => {
                  const cur      = stock.price * stock.qty;
                  const pnl      = cur - stock.avg * stock.qty;
                  const isProfit = pnl >= 0;
                  return (
                    <tr key={stock._id || i}>
                      <td style={{ fontWeight: 600 }}>{stock.name}</td>
                      <td>{stock.qty}</td>
                      <td>₹{fmt(stock.avg)}</td>
                      <td>₹{fmt(stock.price)}</td>
                      <td>₹{fmt(cur)}</td>
                      <td className={isProfit ? "profit" : "loss"}>
                        {isProfit ? "+" : ""}₹{fmt(pnl)}
                      </td>
                      <td className={isProfit ? "profit" : "loss"}>{stock.net}</td>
                      <td className={stock.isLoss ? "loss" : "profit"}>{stock.day}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer totals */}
          <div className="holdings-footer">
            <div className="hf-item">
              <div className="label">Total Investment</div>
              <div className="value">₹{fmt(totalInvestment)}</div>
            </div>
            <div className="hf-item">
              <div className="label">Current Value</div>
              <div className="value">₹{fmt(currentValue)}</div>
            </div>
            <div className="hf-item">
              <div className="label">P&amp;L</div>
              <div className={"value " + (totalPnL >= 0 ? "profit" : "loss")}>
                {totalPnL >= 0 ? "+" : ""}₹{fmt(totalPnL)}&nbsp;
                <small>({totalPnL >= 0 ? "+" : ""}{pnlPct}%)</small>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <VerticalGraph data={chartData} />
          </div>
        </>
      )}
    </div>
  );
};

export default Holdings;
