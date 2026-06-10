import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { Tooltip, Grow } from "@mui/material";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";
import { DoughnutChart } from "./DoughnoutChart";

const CHART_COLORS = [
  "rgba(255,99,132,.6)",  "rgba(54,162,235,.6)",  "rgba(255,206,86,.6)",
  "rgba(75,192,192,.6)",  "rgba(153,102,255,.6)",  "rgba(255,159,64,.6)",
  "rgba(231,76,60,.6)",   "rgba(46,204,113,.6)",   "rgba(52,152,219,.6)",
];

const WatchList = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [query,     setQuery]     = useState("");

  const fetchWatchlist = () => {
    axios.get("/allWatchlist")
      .then((res) => setWatchlist(res.data))
      .catch((err) => console.error("Watchlist fetch error:", err));
  };

  useEffect(() => { fetchWatchlist(); }, []);

  // Filter by search query
  const filtered = query.trim()
    ? watchlist.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : watchlist;

  const chartData = {
    labels: filtered.map((s) => s.name),
    datasets: [{
      label: "Price",
      data:  filtered.map((s) => s.price),
      backgroundColor: CHART_COLORS,
      borderColor:     CHART_COLORS.map((c) => c.replace(/[\d.]+\)$/, "1)")),
      borderWidth: 1,
    }],
  };

  return (
    <div className="watchlist-container">
      {/* Search */}
      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search eg: infy, tcs, wipro"
          className="search"
        />
        <span className="counts">{watchlist.length} / 50</span>
      </div>

      {/* List */}
      <ul className="list">
        {filtered.length === 0 && query ? (
          <li style={{ padding: "16px 14px", color: "#aaa", fontSize: "0.82rem" }}>
            No results for "{query}"
          </li>
        ) : (
          filtered.map((stock, i) => (
            <WatchListItem stock={stock} key={stock._id || i} onOrderPlaced={fetchWatchlist} />
          ))
        )}
      </ul>

      {/* Doughnut chart */}
      {filtered.length > 0 && (
        <div style={{ padding: "12px 8px 16px" }}>
          <DoughnutChart data={chartData} />
        </div>
      )}
    </div>
  );
};

export default WatchList;

// ── Single watchlist row ──────────────────────────────────────────────────────
const WatchListItem = ({ stock, onOrderPlaced }) => {
  const [hover]        = useState(false); // controlled by CSS :hover
  const generalContext = useContext(GeneralContext);

  return (
    <li>
      <div className="item">
        <p className={stock.isDown ? "down" : "up"} style={{ fontWeight: 500, fontSize: "0.83rem" }}>
          {stock.name}
        </p>
        <div className="itemInfo">
          <span className="percent" style={{ color: stock.isDown ? "#e74c3c" : "#27ae60" }}>
            {stock.percent}
          </span>
          {stock.isDown
            ? <KeyboardArrowDown style={{ fontSize: "1rem" }} className="down" />
            : <KeyboardArrowUp   style={{ fontSize: "1rem" }} className="up"   />}
          <span className="price" style={{ fontWeight: 500 }}>{stock.price.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Hover action buttons */}
      <span className="actions">
        <span>
          <Tooltip title="Buy (B)" placement="top" arrow TransitionComponent={Grow}>
            <button className="buy" onClick={() => generalContext.openBuyWindow(stock.name, stock.price)}>
              Buy
            </button>
          </Tooltip>
          <Tooltip title="Sell (S)" placement="top" arrow TransitionComponent={Grow}>
            <button className="sell" onClick={() => generalContext.openSellWindow(stock.name, stock.price)}>
              Sell
            </button>
          </Tooltip>
          <Tooltip title="Analytics" placement="top" arrow TransitionComponent={Grow}>
            <button className="action">
              <BarChartOutlined style={{ fontSize: "1rem" }} className="icon" />
            </button>
          </Tooltip>
          <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
            <button className="action">
              <MoreHoriz style={{ fontSize: "1rem" }} className="icon" />
            </button>
          </Tooltip>
        </span>
      </span>
    </li>
  );
};
