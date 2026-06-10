import React, { useState, useEffect } from "react";
import axios from "axios";

const fmt = (n) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Positions = () => {
  const [allPositions, setAllPositions] = useState([]);

  useEffect(() => {
    axios.get("/allPositions")
      .then((res) => setAllPositions(res.data))
      .catch((err) => console.error("Positions fetch error:", err));
  }, []);

  const totalPnL = allPositions.reduce(
    (s, p) => s + (p.price - p.avg) * p.qty, 0
  );

  return (
    <div>
      <div className="section-header">
        <p className="page-title">Positions ({allPositions.length})</p>
        {allPositions.length > 0 && (
          <span className={"page-title " + (totalPnL >= 0 ? "profit" : "loss")} style={{ fontSize: "0.9rem" }}>
            Day P&amp;L: {totalPnL >= 0 ? "+" : ""}₹{fmt(totalPnL)}
          </span>
        )}
      </div>

      {allPositions.length === 0 ? (
        <div className="empty-state">
          <p>No open positions.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Instrument</th>
                <th>Qty</th>
                <th>Avg</th>
                <th>LTP</th>
                <th>P&amp;L</th>
                <th>Chg.</th>
              </tr>
            </thead>
            <tbody>
              {allPositions.map((stock, i) => {
                const pnl      = (stock.price - stock.avg) * stock.qty;
                const isProfit = pnl >= 0;
                return (
                  <tr key={i}>
                    <td>
                      <span className="badge" style={{ background: "#f0f0f0", color: "#555" }}>
                        {stock.product}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{stock.name}</td>
                    <td>{stock.qty}</td>
                    <td>₹{fmt(stock.avg)}</td>
                    <td>₹{fmt(stock.price)}</td>
                    <td className={isProfit ? "profit" : "loss"}>
                      {isProfit ? "+" : ""}₹{fmt(pnl)}
                    </td>
                    <td className={stock.isLoss ? "loss" : "profit"}>{stock.day}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Positions;
