import React from "react";
import { Route, Routes } from "react-router-dom";

import { GeneralContextProvider } from "./GeneralContext";
import WatchList  from "./WatchList";
import Summary    from "./Summary";
import Orders     from "./Orders";
import Holdings   from "./Holdings";
import Positions  from "./Positions";
import Funds      from "./Funds";
import Profile    from "./Profile";
import Apps       from "./Apps";

const Dashboard = () => {
  return (
    <GeneralContextProvider>
      <div className="dashboard-container">
        <WatchList />
        <div className="content">
          <Routes>
            <Route path="/*"         element={<Summary   />} />
            <Route path="/orders"    element={<Orders    />} />
            <Route path="/holdings"  element={<Holdings  />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/funds"     element={<Funds     />} />
            <Route path="/profile"   element={<Profile   />} />
            <Route path="/apps"      element={<Apps      />} />
          </Routes>
        </div>
      </div>
    </GeneralContextProvider>
  );
};

export default Dashboard;
