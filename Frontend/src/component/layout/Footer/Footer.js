import React from 'react'
import './Footer.css';
import appstore from "./Appstore.png";
import playstore from "./playstore.png"
const Footer = () => {
  return (
    <footer id="footer">
    <div className="leftFooter">
      <h4>DOWNLOAD OUR APP</h4>
      <p>Download App for Android and IOS mobile phone</p>
      <img src={playstore} alt="playstore" />
      <img src={appstore} alt="Appstore" />
    </div>

    <div className="midFooter">
      <h1>ECOMM.</h1>
      <p>High Quality is our first priority</p>

      <p>Copyrights 2021 &copy; Ecomm</p>
    </div>

    <div className="rightFooter">
      <h4>Follow Us</h4>
      <a href="www.google.com">Instagram</a>
      <a href="www.google.com">Youtube</a>
      <a href="www.google.com">Facebook</a>
    </div>
  </footer>
  )
}

export default Footer