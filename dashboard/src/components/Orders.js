import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Orders = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    axios.get("/allOrders")
      .then((res) => { setOrders(res.data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  useEffect(() => {
    fetchOrders();
    window.addEventListener("orderPlaced", fetchOrders);
    return () => window.removeEventListener("orderPlaced", fetchOrders);
  }, [fetchOrders]);

  const buyCount  = orders.filter((o) => o.mode === "BUY").length;
  const sellCount = orders.filter((o) => o.mode === "SELL").length;

  if (loading) return <div className="empty-state"><p>Loading orders…</p></div>;

  return (
    <div>
      <div className="section-header">
        <p className="page-title">Orders ({orders.length})</p>
        {orders.length > 0 && (
          <span style={{ fontSize: "0.78rem", color: "#888" }}>
            <span className="profit">{buyCount} BUY</span>
            &nbsp;·&nbsp;
            <span className="loss">{sellCount} SELL</span>
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders yet.</p>
          <p style={{ fontSize: "0.8rem", marginTop: 4 }}>
            Go to the watchlist and place a buy or sell order.
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
            Go to Watchlist
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Instrument</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => {
                const time = order.createdAt
                  ? new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                  : "—";
                return (
                  <tr key={order._id || i}>
                    <td style={{ color: "#999", fontSize: "0.75rem" }}>{time}</td>
                    <td style={{ fontWeight: 600 }}>{order.name}</td>
                    <td>
                      <span className={"badge " + (order.mode === "BUY" ? "badge-buy" : "badge-sell")}>
                        {order.mode}
                      </span>
                    </td>
                    <td>{order.qty}</td>
                    <td>{order.price > 0 ? "₹" + Number(order.price).toLocaleString("en-IN") : "Market"}</td>
                    <td>
                      <span className="badge" style={{ background: "#e8f5e9", color: "#27ae60" }}>
                        COMPLETE
                      </span>
                    </td>
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

export default Orders;
