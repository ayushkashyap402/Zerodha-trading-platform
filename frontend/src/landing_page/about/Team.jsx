import React from "react";

function Team() {
  return (
    <div className="container">
      <div className="row p-3 mt-5">
        <h1 className="text-center ">Project Team</h1>
      </div>

      <div
        className="row p-3 text-muted"
        style={{ lineHeight: "1.8", fontSize: "1.2em" }}
      >
        <div className="col-4 p-3 text-center">
          <img
            src="media/images/Ayush1.jpg"
            style={{ borderRadius: "100%", width: "50%" }}
          />
          <h4 className="mt-5">Ayush Kashyap</h4>
          <h6>Full-stack Developer</h6>
        </div>
        <div className="col-4 p-3 text-center">
          <img
            src="media/images/Aashi.jpg"
            style={{ borderRadius: "100%", width: "50%" }}
          />
          <h4 className="mt-5">Aashi Gupta</h4>
          <h6>Report &amp; Content writer</h6>
        </div>
        <div className="col-4 p-3 text-center">
          <img
            src="media/images/Divyansh.jpg"
            style={{ borderRadius: "100%", width: "50%" }}
          />
          <h4 className="mt-5">Divyansh Vishwakarma</h4>
          <h6>Member</h6>
        </div>
      </div>
      </div>
      
  );
}

export default Team;
