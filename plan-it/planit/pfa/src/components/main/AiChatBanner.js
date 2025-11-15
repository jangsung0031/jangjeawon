import React from 'react';
import { Link } from 'react-router-dom';
import bannerBackground from '../../img/Mtravel-illust-bg.jpg';
import aiMapImage from '../../img/ai-map.png';
import '../../css/main/AiChatBanner.css';


const AiChatBanner = () => {
  return (
    <div
      className="ai-banner-container"
      style={{ backgroundImage: `url(${bannerBackground})` }}
    >
      <div className="ai-banner-content-left">
        <h1 className="ai-banner-title">
          <span>AI콕콕 플래너</span>
          <span className="ai-banner-subtitle">Planner</span>
        </h1>
        <p className="ai-banner-description">
          여행은 가고싶은데 계획 짜기 귀찮을때 <br />
          1분이면 끝! ai가 함께 만드는 나만을 위한 여행 코스
        </p>
        <Link to="/aitalk" className="ai-banner-button">
          코스만들기 &rarr;
        </Link>
      </div>
      <div className="ai-banner-content-right">
        <div className="map-image-wrapper">
          <img src={aiMapImage} alt="AI Planner Map" className="ai-map-image" />
          <div className="map-tag tag-top-right">#맞춤형 코스 추천</div>
          <div className="map-tag tag-mid-right">#AI가 다~ 계획해드림</div>
          <div className="map-tag tag-bottom-right">#나만의 여행 스케치</div>
          <div className="map-tag tag-top-left">#인기 스팟 최적화</div>
          <div className="map-tag tag-mid-left">#BEST 코스 도전</div>
        </div>
      </div>
    </div>
  );
};

export default AiChatBanner;