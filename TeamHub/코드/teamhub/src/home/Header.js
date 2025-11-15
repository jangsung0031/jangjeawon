import { Link, useNavigate } from "react-router-dom";
import "../css/Header.css";
import React, { useState, useEffect } from "react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleUserLogin = () => {
      const storedUser = sessionStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("userLogin", handleUserLogin);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("userLogin", handleUserLogin);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleDropdown = (key) => {
    if (!isMobile) return;
    setDropdownOpen(dropdownOpen === key ? null : key);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setMenuOpen(false);
      setDropdownOpen(null);
    }
  };

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";
  const username = user?.username || "";

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("userLogin"));
    navigate("/");
    handleLinkClick();
  };

  return (
    <div className="header-wrapper">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo-link" onClick={handleLinkClick}>
            <img src="/img/logo.png" alt="TeamHub Logo" className="logo-img" />
          </Link>

          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <i className="bi bi-grid" style={{ fontSize: "1.8rem", color: "rgb(20,51,32)" }}></i>
          </div>

          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            {isLoggedIn ? (
              <>
                {isAdmin ? (
                  <>
                    <Link to="/admin/room.page" onClick={handleLinkClick}>객실 관리</Link>
                    <Link to="/admin/water.page" onClick={handleLinkClick}>수상레저 관리</Link>
                    <div className="dropdown">
                      <span className="dropbtn" onClick={() => toggleDropdown("adminpage")}>
                        관리페이지
                      </span>
                      <div className={`dropdown-section ${dropdownOpen === "adminpage" ? "show" : ""}`}>
                        <Link to="/admin/reviews" onClick={handleLinkClick}>후기 관리</Link>
                        <Link to="/community/notice" onClick={handleLinkClick}>공지사항</Link>
                        <Link to="/community/qna" onClick={handleLinkClick}>Q&A</Link>
                        <Link to="/admin/qna/manage" onClick={handleLinkClick}>Q&A 답변대기</Link>
                        <Link to="/community/faq" onClick={handleLinkClick}>FAQ</Link>
                      </div>
                    </div>
                    {!isMobile && (
                          <button onClick={handleLogout} className="logout-link">로그아웃</button>
                        )}
                  </>
                ) : (
                  <>
                    <div className="dropdown">
                      <span className="dropbtn" onClick={() => toggleDropdown("room")}>
                        객실
                      </span>
                      <div className={`dropdown-section ${dropdownOpen === "room" ? "show" : ""}`}>
                        <Link to="/roomIntro" onClick={handleLinkClick}>객실 소개</Link>
                        <Link to="/room" onClick={handleLinkClick}>객실 예약</Link>
                      </div>
                    </div>
                    <div className="dropdown">
                      <span className="dropbtn" onClick={() => toggleDropdown("leisure")}>
                        수상레저
                      </span>
                      <div className={`dropdown-section ${dropdownOpen === "leisure" ? "show" : ""}`}>
                        <Link to="/leisure/intro" onClick={handleLinkClick}>수상 레저 소개</Link>
                        <Link to="/leisure/reserve" onClick={handleLinkClick}>이용권</Link>
                      </div>
                    </div>
                    <Link to="/activity" onClick={handleLinkClick}>실내 액티비티</Link>
                    <div className="dropdown">
                      <span className="dropbtn" onClick={() => toggleDropdown("support")}>
                        고객지원
                      </span>
                      <div className={`dropdown-section ${dropdownOpen === "support" ? "show" : ""}`}>
                        <Link to="/community/notice" onClick={handleLinkClick}>공지사항</Link>
                        <Link to="/community/qna" onClick={handleLinkClick}>Q&A</Link>
                        <Link to="/community/faq" onClick={handleLinkClick}>FAQ</Link>
                        <Link to="/reviews">리뷰</Link>
                      </div>
                    </div>
                    <div className="dropdown">
                      <span className="dropbtn" onClick={() => toggleDropdown("mypage")}>
                        마이페이지
                      </span>
                      <div className={`dropdown-section ${dropdownOpen === "mypage" ? "show" : ""}`}>
                        <Link to="/mypage" onClick={handleLinkClick}>내 정보 관리</Link>
                        <Link to="/mypage/reservations" onClick={handleLinkClick}>수상레저 예약 확인</Link>
                        <Link to="/mypage/room" onClick={handleLinkClick}>객실 예약 확인</Link>
                        <Link to="/my-reviews" onClick={handleLinkClick}>내 리뷰</Link>
                      </div>
                    </div>
                    {!isMobile && (
                          <button onClick={handleLogout} className="logout-link">로그아웃</button>
                        )}
                  </>
                )}

                <div className="user-welcome">{username}님 환영합니다</div>

                   {isMobile && isLoggedIn && (
                    <div className="mobile-auth-logout-buttons">
                      <button 
                        onClick={() => {
                          handleLogout();
                        }} 
                        className="logout-link"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
              </>
            ) : (
              <>
                <Link to="/roomIntro" onClick={handleLinkClick}>객실 소개</Link>
                <Link to="/leisure/intro" onClick={handleLinkClick}>수상 레저 소개</Link>
                <Link to="/activity" onClick={handleLinkClick}>실내 액티비티</Link>
                <div className="dropdown">
                  <span className="dropbtn" onClick={() => toggleDropdown("support_guest")}>
                    고객지원
                  </span>
                  <div className={`dropdown-section ${dropdownOpen === "support_guest" ? "show" : ""}`}>
                    <Link to="/community/notice" onClick={handleLinkClick}>공지사항</Link>
                    <Link to="/community/qna" onClick={handleLinkClick}>Q&A</Link>
                    <Link to="/community/faq" onClick={handleLinkClick}>FAQ</Link>
                    <Link to="/reviews">리뷰</Link>
                  </div>
                </div>
                  {!isMobile && !isLoggedIn && (
                  <>
                    <Link to="/form" onClick={handleLinkClick}>로그인/회원가입</Link>
                  </>
                  )}

                  {isMobile && !isLoggedIn && (
                    <div className="mobile-auth-buttons">
                      <button
                        className="create-account"
                        onClick={() => {
                          handleLinkClick();
                          navigate("/form");
                        }}
                      >
                        계정 생성
                      </button>
                      <button
                        className="login-button"
                        onClick={() => {
                          handleLinkClick();
                          navigate("/form");
                        }}
                      >
                        로그인
                      </button>
                    </div>
                  )}
              </>
            )}
          </nav>
        </div>
      </header>
    </div>
  );
};

export default Header;
