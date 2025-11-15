import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../css/main/MainThemeSection.css";
import TravelCard from "./TravelCard";

const themeItems = [
  { id: 1, image: "/images/theme-cosmos.jpg",   title: "봄의 정취를 머금은 월하",  description: "아름다운 야경의",     link: "/theme/spring-flowers" },
  { id: 2, image: "/images/theme-hanok.jpg",    title: "시원하고 산뜻한 여름",    description: "산에서 휴식을 즐기는", link: "/theme/summer-vacation" },
  { id: 3, image: "/images/theme-autumn.jpg",   title: "황금빛으로 물드는 가을",  description: "웜톤으로 물들어가는",   link: "/theme/autumn-leaves" },
  { id: 4, image: "/images/theme-fireworks.jpg",title: "겨울의 시작을 알리는 11월 축제", description: "크리스마스가 기대되는", link: "/theme/winter-festival" },
];

export default function MainThemeSection() {
  const [isMobile, setIsMobile] = useState(false);

  // 뷰포트 감지 (초기/변경)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // PC 캐러셀
  const pcSettings = useMemo(() => ({
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "60px",
    slidesToShow: 3,
    slidesToScroll: 1,
    speed: 500,
    arrows: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 2 } },
    ],
  }), []);

  // 모바일 1장 풀폭 (점/패딩/센터모드 OFF)
  const mobileSettings = useMemo(() => ({
    className: "mobile-one",
    centerMode: false,
    infinite: false,
    centerPadding: "0px",
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 400,
    arrows: false,
    dots: false,          // ← 점 제거
    variableWidth: false,
    swipeToSlide: true,
    autoplay: false,
  }), []);

  // 설정 변경 시 리마운트
  const sliderKey = (isMobile ? "theme-m-" : "theme-pc-") + themeItems.length;

  return (
    <div className={`theme-carousel-outer-container ${isMobile ? "is-mobile" : ""}`}>
      <h2 className="theme-section-title">함께 떠나는 힐링테마 여행</h2>

      <Slider key={sliderKey} {...(isMobile ? mobileSettings : pcSettings)}>
        {themeItems.map((item) => (
          <div key={item.id}>
            <Link to={item.link}>
              <TravelCard image={item.image} title={item.title} description={item.description} />
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
}
