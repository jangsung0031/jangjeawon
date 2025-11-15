import React, { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import default_img from '../../img/default_img.png';
import menu_btn from '../../img/menu_btn.svg';
import share_btn from '../../img/share_btn.svg';
import wishlist_btn_false from '../../img/wishlist_btn_false.svg';
import wishlist_btn_true from '../../img/wishlist_btn_true.svg';
import liked_count from '../../img/liked_true.svg';
import apiClient from "../../module/apiClient";

const TourCard = ({ tour, images, category, arrange, currentPage, onAddressClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = () => {
    const token = sessionStorage.getItem('token');
    setIsMenuOpen(!isMenuOpen);
    if (token) {
      fetchFavoriteToggled(tour.uniqueKey);
    }
  };

  const primaryImage = images && images.length > 0 ? images[0] : default_img;

  const handleCardClick = async () => {
    try {
        const uniqueKey = tour.uniqueKey;
        
        const response = await axios.get(`/api/tour/detail/checkData?uniqueKey=${uniqueKey}`);
        
        if (response.data === true) {
          navigate(`/tourinfo/${tour.city}/${tour.sigungu}/${category}/${arrange}/${currentPage}/${uniqueKey}`);
        } else {
          alert("여행지 상세 정보 불러오기에 실패했습니다.");
        }

    } catch (err) {
        console.error("데이터 확인 중 오류가 발생했습니다." + err);
        alert("데이터 처리 중 문제가 발생했습니다.");
    }
  };

  const fetchFavoriteToggle = async (uniqueKey) => {
    if (!uniqueKey) return;
    try {
      const response = await apiClient.post(`/api/tour/detail/user/favorite?uniqueKey=${uniqueKey}`);

      setFavorited(response.data.favorited);
      if (response.data.favorited) {
        alert("즐겨찾기 추가 완료!");
      } else {
        alert("즐겨찾기 취소 완료!");
      }
    } catch (err) {
      console.error(err);
    }
  }

  const fetchFavoriteToggled = async (uniqueKey) => {
    if (!uniqueKey) return;
    try {
      const response = await apiClient.get(`/api/tour/detail/user/status?uniqueKey=${uniqueKey}`);
      setFavorited(response.data.favorited);
    } catch (err) {
      console.error(err);
    }
  }

  const handleFavoriteClick = () => {
    const token = sessionStorage.getItem('token');
    if (token) {
      fetchFavoriteToggle(tour.uniqueKey);
    } else {
      const chk = window.confirm("로그인이 필요한 서비스 입니다.\n로그인 화면으로 이동하시겠습니까?");
      if (chk) {
        const redirectPath = encodeURIComponent(location.pathname);
        navigate(`/login?redirect=${redirectPath}`, { state: { tourData: tour } });
      }
    }
  }

  const handleShareClick = () => {
    const URL = `localhost/tourinfo/${tour.city}/${tour.sigungu}/${category}/${arrange}/${currentPage}/${tour.uniqueKey}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(URL)
            .then(() => {
                alert('URL이 클립보드에 복사되었습니다!');
            })
            .catch(err => {
                console.error('클립보드 복사 실패:', err);
            });
    }
}

  const cleanName = (fullName) => {
    const regex = /(\s*[\(|\[].*?)[\(|\[].*$/;
    let cleanedName = fullName;
    if (fullName.match(regex)) {
        cleanedName = fullName.replace(regex, '$1');
    }
    if (cleanedName.length < 5) {
      return fullName;
    } 
    return cleanedName;
  }
  const finalCleanName = cleanName(tour.name);

  const handleAddressClick = () => {
      onAddressClick(tour.addr, finalCleanName);
  };

  const renderWithLineBreaks = (text) => {
    const lines = text.split(/<br\s*\/?>/i);

    return lines.map((line, index) => (
      <React.Fragment key={index}>
      {line}
      {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };
  
  return (
    <div className="tour-card" key={tour.uniqueKey}>
      <img
        src={primaryImage}
        alt={tour.name}
        className="tour-card-image"
        onClick={handleCardClick} />
      <div className="tour-card-info">
        <span onClick={handleCardClick} className="title">{finalCleanName}</span>
        <div className="address" onClick={handleAddressClick}>{tour.addr}</div>
        <div className="details">{renderWithLineBreaks(tour.intro)}</div>
        <div className="tags">
        </div>
      </div>
      <div className="menu-container">
      <div className="right-controls-stack">
          <img
              src={menu_btn}
              className="menu-btn"
              onClick={handleMenuClick}
              alt="메뉴 버튼"
          />
          {(tour.likeCount !== null) &&
          <div className="like-container">
              <img
                  src={liked_count}
                  className="like-count-img"
                  alt="하트 이미지"
              />
              <div
                  className="like-count"
                  alt="좋아요 개수"
              >{tour.likeCount}</div>
          </div>
          }
      </div>
        
      {isMenuOpen && (
        <>
          <div className="menu-popup-overlay" onClick={() => setIsMenuOpen(false)}></div>
          <ul className="menu-popup">
            <li onClick={handleFavoriteClick}>
              <img
                src={favorited ? wishlist_btn_true : wishlist_btn_false}
                className="icon"
                alt="즐겨찾기"
              />
              <span className="text">즐겨찾기</span>
            </li>
            <li onClick={handleShareClick}>
              <img
                src={share_btn}
                className="icon"
                alt="공유하기"
              />
              <span className="text">공유하기</span>
            </li>
          </ul>
        </>
      )}
    </div>
    </div>
  );
};

export default TourCard;
