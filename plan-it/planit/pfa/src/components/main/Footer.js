import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import logo from '../../img/hederlogo.png';
import '../../css/main/Footer.css';

const Footer = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = sessionStorage.getItem('role');
    setUserRole(role);
  }, []);

  const planitLinks = [
    { to: '/about', label: '회사 소개' },
    { to: '/careers', label: '채용' },
    { to: '/contact', label: '고객센터' },
  ];

  const policyLinks = [
    { to: '/terms', label: '이용약관' },
    { to: '/privacy', label: '개인정보처리방침' },
  ];

  return (
    <footer className="footer-container">
      <div className="footer-top-section">
        <div className="footer-left">
          <img src={logo} alt="Planit Logo" className="footer-logo" />
          <p className="footer-description">
            AI와 함께 만드는 나만의 여행, Planit
          </p>
        </div>
        <div className="footer-right">
          <div className="footer-info">
          <Link to="/admin/login" className="footer-company-link">
            (주)플래닛
          </Link>
          <span>팀장: 이영민</span>
          <span>팀원: 장재원 / 방태영 / 유정현 / 김종윤</span>
        </div>
        
        <div className='footer-copyright'>
          <span>이 사이트는 교육용으로 실제로 지원하지 않습니다.</span>
        </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;