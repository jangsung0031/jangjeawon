import React from "react";
import "../css/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-logo">TeamHub</div>
        <p className="footer-text">정동화(팀장) 장재원(부팀장) 김준경 유정현 이영민</p>
        <p className="footer-copy">© 2025 TeamHub. 이 사이트는 교육용 프로젝트입니다.</p>
      </div>
    </footer>
  );
};

export default Footer;