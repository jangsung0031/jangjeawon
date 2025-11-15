import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainFestivalCarousel from './main/MainFestivalCarousel';
import MainThemeSection from './main/MainThemeSection';
import '../css/Home.css';
import AiChatBanner from './main/AiChatBanner';
import RegionCarousel from './main/RegionCarousel'; 


const HomePage = () => {

  useEffect(() => {
    document.body.classList.add('home-background');

    return () => {
      document.body.classList.remove('home-background');
    };
  }, []);

  return (
    <div className="home-container">
      <AiChatBanner />
      <MainFestivalCarousel />
      <RegionCarousel />
      <MainThemeSection />
      {/* Footer는 App.js 같은 상위 컴포넌트로 이동하는 것을 추천합니다. */}
      {/* <Footer /> */}
    </div>
  );
};

export default HomePage;