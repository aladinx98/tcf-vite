import React from "react";
import "./style.css";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-images">
        <div
          className="footer-block"
          onClick={() => {
            window.open("https://www.google.com", "_");
          }}
        >
         
        </div>
      </div>
      <br></br>
      <p className="rights">All Rights Reserved By BITTU BEE</p>
    </div>
  );
};

export default Footer;
