import React from "react";
import Menu from "./Menu";

const TopBar = ({ user }) => {
  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="nifty">
          <p className="index">NIFTY 50</p>
          <p className="index-points">22,350.25</p>
          <p className="percent down">-0.42%</p>
        </div>
        <div className="sensex">
          <p className="index">SENSEX</p>
          <p className="index-points">73,648.62</p>
          <p className="percent down">-0.38%</p>
        </div>
      </div>

      <Menu user={user} />
    </div>
  );
};

export default TopBar;
