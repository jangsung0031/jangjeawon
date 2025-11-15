import React, { useState } from "react";
import "../css/Main.css";
import ChatBot from "./ChatBot"; 
import "../css/ChatBotFloat.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <div className="arrow next" onClick={onClick}>
      ❯
    </div>
  );
};

const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div className="arrow prev" onClick={onClick}>
      ❮
    </div>
  );
};

const insideImages = [
  "ant.jpg",
  "bolling.jpg",
  "dangu.jpg",
  "k1.jpg",
  "pc.jpg",
  "singroom.jpg",
];

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 800,
  slidesToShow: 2,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  centerMode: true,
  centerPadding: "0px",
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        centerMode: false,
      },
    },
  ],
};


const Main = () => {

  const [isChatOpen, setIsChatOpen] = useState(false);
  const toggleChat = () => setIsChatOpen(!isChatOpen);
  return (
    <div className="main-container">
      <div className="main-hero">
        <img src="/img/Main.jpg" alt="Main Visual" className="main-image" />
        <div className="hero-text">Where your rest begins</div>
      </div>

      <section className="main-section welcome">
        <div className="welcome-text">
          <h2>Welcome to TeamHub</h2>
          <p>
            TeamHub는 바쁜 일상 속에서도 진정한 쉼을 누릴 수 있는 공간을 선물합니다. <br />
            단순한 예약 플랫폼을 넘어, 당신의 하루에 여유를 더하고,
            소중한 사람들과의 추억을 만들어주는 특별한 경험을 제공합니다.
            <br /><br />
            자연과 어우러진 객실, 설렘이 가득한 수상 액티비티,
            마음이 정화되는 실내 프로그램까지 — <br />
            TeamHub는 여러분이 머무는 모든 순간이
            기억에 남을 ‘따뜻한 쉼표’가 되도록 설계되었습니다.
            <br /><br />
            지금, 나만의 힐링을 시작해보세요.
            TeamHub는 언제나 당신의 곁에서 조용히 문을 열어두고 기다립니다.
          </p>
          <img src="/img/vac.jpg" alt="Vacation" className="vac-image" />
        </div>
        <img src="/img/wateracti.jpg" alt="Water Activity" className="water-image" />
      </section>

      <section className="main-section explore">
        <h2>Explore your moment</h2>
        <p>
          TeamHub는 당신의 일상에 작은 쉼표를 선사합니다. <br />
          조용한 숲길에서부터 잔잔한 물가 풍경까지, <br />
          TeamHub의 모든 공간은 당신을 위한 부드러운 휴식처입니다.
        </p>
      </section>

      <section className="main-section slider">
        <div className="main-slider-container">
        <Slider {...sliderSettings}>
          {insideImages.map((img, idx) => (
            <div key={idx} className="slide-card">
               <img src={`/img/${img}`} alt={`Slide ${idx + 1}`} />
            </div>
          ))}
        </Slider>
        </div>
      </section>

      <button className="chat-toggle-btn" onClick={toggleChat}>
        💬
      </button>
      {isChatOpen && <ChatBot />}
    </div>
  );
};

export default Main;
