import React from 'react';

function Hero() {
    return (
    <section className="container-fluid" id="supportHero">
      <div className="p-3 " id="supportWrapper">
        <h4 className='mt-3'>Support Portal</h4>
        <a href="" >Track Tickets</a>
      </div>
      <div className="row p-5 mt-3">
        <div className='col'></div>
        <div className="col-5 p-3">
          <h1 className="fs-3 mb-3">
            Search for an answer or browse help topics to create a ticket
          </h1>
          <input placeholder="Eg. how do I activate F&O ,why is my order getting rejected..."  className='mb-3'/>
          <br />
          <a href="" className='mx-1'>Track account opening</a>
          <a href="" className='mx-2'>Track segment activation</a>
          <a href="" className='mx-2'>Intraday margins</a>
          <a href="" className='mx-2'>Kite user manual</a>
        </div>
        <div className='col'></div>        
        <div className="col-5 p-3">
          <h1 className="fs-3 p-1">Featured</h1>
          <ol>
            <li>
              <a href="" style={{lineHeight:"2"}}>Current Takeovers and Delisting - January 2024</a>
            </li>
            <li>
              <a href="" style={{lineHeight:"2"}}>Latest Intraday leverages - MIS & CO</a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export default Hero;
