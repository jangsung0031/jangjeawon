import React from "react";
import Slider from "react-slick";
import "../css/LeisureIntro.css";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const items = [
  { src: "/img/test1.jpg", name: "플라이 피쉬" },
  { src: "/img/test2.jpg", name: "디스코보트" },
  { src: "/img/test3.jpg", name: "와일드 슬라이드" },
  { src: "/img/test4.jpg", name: "제트스키" },
  { src: "/img/test5.jpg", name: "워터타노스" },
  { src: "/img/test6.jpg", name: "더블바나나보트" },
  { src: "/img/test7.jpg", name: "디스코팡팡" },
  { src: "/img/test8.jpg", name: "밴드웨건" },
  { src: "/img/test9.jpg", name: "헥사곤" },
  { src: "/img/test10.jpg", name: "로터스" },
  { src: "/img/test11.jpg", name: "땅콩" },
  { src: "/img/test12.jpg", name: "바나나보트" },
];

const NextArrow = (props) => {
  const { onClick } = props;
  return <div className="leisure-arrow next" onClick={onClick}>❯</div>;
};

const PrevArrow = (props) => {
  const { onClick } = props;
  return <div className="leisure-arrow prev" onClick={onClick}>❮</div>;
};

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 800,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  centerMode: false,
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

function LeisureIntro() {
  const navigate = useNavigate();

  return (
    <div className="intro-container">
      <h2 className="intro-title">수상레저 시설 소개</h2>

      <section className="main-section slider">
        <div className="leisure-slider-container">
        <Slider {...sliderSettings}>
          {items.map((item, idx) => (
            <div key={idx} className="leisure-slide-card">
              <img src={item.src} alt={item.name} />
            </div>
          ))}
        </Slider>
        </div>
      </section>

      <div className="facility-section">
        <div className="facility-grid">
          {items.map((item, index) => (
            <div className="facility-card" key={index} onClick={() => navigate(`/leisure/${item.name}`)}> 
              <img src={item.src} alt={item.name} />
              <div className="card-body">
                <h3>{item.name}</h3>
                <p>스릴 넘치는 수상 액티비티!</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LeisureIntro;
