import React from "react";
import Logo from "../../images/TCF.png";
import "./style.css";
import { Web3Button } from '@web3modal/react';

const Header = () => {
  

  return (
    <div className="header">
      <img src={Logo} alt="logo" />
      <div>
      <Web3Button />
      </div>
    </div>
  );
};

export default Header;
