import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../img/hederlogo.png";
import "../css/Header.css";
import { FiChevronDown } from "react-icons/fi"; // ✅ 모바일 아코디언 화살표
import { FaBars, FaTimes, FaMapMarkedAlt } from "react-icons/fa";

function Header() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // ✅ 모바일 전용 드롭다운(아코디언)
  const [isMobile, setIsMobile] = useState(false);         // ✅ 뷰포트 구분

  const [loginInfo, setLoginInfo] = useState({
    token: null,
    role: null,
    nickname: null,
  });

  // 모바일/PC 감지
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handle = (e) => setIsMobile(e.matches);
    handle(mq);
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  // 토큰 변경 시 로그인 정보 반영
  useEffect(() => {
    setLoginInfo({
      token: sessionStorage.getItem("token"),
      role: sessionStorage.getItem("role"),
      nickname: sessionStorage.getItem("nickname"),
    });
  }, [sessionStorage.getItem("token")]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((v) => !v);
    setDropdownOpen(false); // 메뉴 열고 닫을 때 아코디언 닫기
  };

  const toggleDropdown = () => setDropdownOpen((v) => !v);

  const handleLogout = () => {
    sessionStorage.clear();
    alert("로그아웃 되었습니다.");
    setLoginInfo({ token: null, role: null, nickname: null });
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const { token, role, } = loginInfo;

  // 모바일에서 링크 클릭 시 메뉴 닫기
  const closeMobile = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
      setDropdownOpen(false);
    }
  };

  return (
    <header className="header">
      {/* 모바일 전용 헤더 */}
      <div className="mobile-header">
        <img
          src={logo}
          alt="Planit Logo"
          className="mobile-logo"
          onClick={() => { navigate("/"); closeMobile(); }}
          style={{ cursor: "pointer" }}
        />
        <div className="hamburger-icon" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>

      {/* PC 전용 로고 */}
      <div className="logo-container">
        <img
          src={logo}
          alt="Planit Logo"
          className="logo-image"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        />
      </div>

      {/* 모바일 전용 백드롭 */}
      {mobileMenuOpen && <div className="mobile-backdrop" onClick={toggleMobileMenu} />}

      {/* 내비게이션 */}
      <nav className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
        {!token && (
          <>
            <Link to="/" className="nav-link" onClick={closeMobile}>홈</Link>
            <Link to="/course/list" className="nav-link" onClick={closeMobile}>여행코스</Link>
            <Link to="/aitalk" className="nav-link" onClick={closeMobile}>AI톡</Link>
            <Link to="/tourlist/전체/전체/전체/P/1" className="nav-link" onClick={closeMobile}>여행지</Link>
            <Link to="/festival" className="nav-link" onClick={closeMobile}>축제</Link>
            <Link to="/map" className="nav-link" onClick={closeMobile}>주변 탐방</Link>
            <Link to="/login" className="nav-link" onClick={closeMobile}>로그인</Link>
            <Link to="/signup" className="nav-link" onClick={closeMobile}>회원가입</Link>
          </>
        )}

        {token && role === "USER" && (
          <>
            <Link to="/" className="nav-link" onClick={closeMobile}>홈</Link>

            {/* ✅ 모바일에서는 아코디언, PC에서는 hover 드롭다운 */}
            {isMobile ? (
              <div className="accordion">
                <button
                  type="button"
                  className="accordion-trigger"
                  onClick={toggleDropdown}
                  aria-expanded={dropdownOpen}
                >
                  <span className="nav-link">여행코스</span>
                  <FiChevronDown className={`chev ${dropdownOpen ? "rotate" : ""}`} />
                </button>

                <ul className={`accordion-panel ${dropdownOpen ? "open" : ""}`}>
                  <li>
                    <Link
                      to="/course/list"
                      className="accordion-item"
                      onClick={closeMobile}
                    >
                      여행코스 리스트
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/tour"
                      className="accordion-item"
                      onClick={closeMobile}
                    >
                      나만의 여행코스 등록
                    </Link>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="dropdown">
                <span className="nav-link">여행코스</span>
                <div className="dropdown-menu">
                  <Link to="/course/list" className="dropdown-item">여행코스 리스트</Link>
                  <Link to="/tour" className="dropdown-item">나만의 여행코스 등록</Link>
                </div>
              </div>
            )}

            <Link to="/aitalk" className="nav-link" onClick={closeMobile}>AI톡</Link>
            <Link to="/tourlist/전체/전체/전체/P/1" className="nav-link" onClick={closeMobile}>여행지</Link>
            <Link to="/festival" className="nav-link" onClick={closeMobile}>축제</Link>
            <Link to="/map" className="nav-link" onClick={closeMobile}>주변 탐방</Link>
            <Link to="/mypage" className="nav-link" onClick={closeMobile}>마이페이지</Link>
            <span onClick={handleLogout} className="nav-link logout-button">로그아웃</span>
          </>
        )}

        {token && role === "ADMIN" && (
          <>
            <Link to="/admin" className="nav-link" onClick={closeMobile}>홈</Link>
            <Link to="/admin/users" className="nav-link" onClick={closeMobile}>회원 목록</Link>
            <Link to="/admin/users/withdrawn" className="nav-link" onClick={closeMobile}>탈퇴 회원 목록</Link>
            <Link to="/admin/reports" className="nav-link" onClick={closeMobile}>댓글 신고 관리</Link>
            <span onClick={handleLogout} className="nav-link logout-button">로그아웃</span>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
