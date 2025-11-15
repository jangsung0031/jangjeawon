import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../css/main/RegionCarousel.css";

const RegionCarousel = () => {
  const majorRegions = [
    { name: "서울", image: "/images/seoul.jpg", url: "tourlist/서울/전체/전체/P/1" },
    { name: "부산", image: "/images/busan.jpg", url: "tourlist/부산/전체/전체/P/1" },
    { name: "제주", image: "/images/jeju.jpg", url: "tourlist/제주특별자치도/전체/전체/P/1" },
    { name: "강릉", image: "/images/gangneung.jpg", url: "tourlist/강원특별자치도/강릉시/전체/P/1" },
    { name: "경주", image: "/images/gyeongju.jpg", url: "tourlist/경상북도/경주시/전체/P/1" },
    { name: "전주", image: "/images/jeonju.jpg", url: "tourlist/전북특별자치도/전주시/전체/P/1" },
  ];

  const [isMobile, setIsMobile] = useState(false);

  // 뷰포트 감지
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // PC 설정
  const pcSettings = useMemo(
    () => ({
      centerMode: true,
      infinite: true,
      centerPadding: "60px",
      slidesToShow: 3,
      slidesToScroll: 1,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 3000,
      arrows: true,
      responsive: [{ breakpoint: 1200, settings: { slidesToShow: 2, centerPadding: "40px" } }],
    }),
    []
  );

  // 모바일 1장 풀폭(점/센터패딩/센터모드 OFF)
  const mobileSettings = useMemo(
    () => ({
      centerMode: false,
      infinite: false,
      centerPadding: "0px",
      slidesToShow: 1,
      slidesToScroll: 1,
      speed: 400,
      autoplay: false,
      arrows: false,
      dots: false,
      variableWidth: false,
      swipeToSlide: true,
    }),
    []
  );

  // 설정 전환 시 리마운트
  const sliderKey = (isMobile ? "region-m-" : "region-pc-") + majorRegions.length;

  return (
    <div className={`region-carousel-section ${isMobile ? "is-mobile" : ""}`}>
      <div className="region-carousel-container">
        <h2>어디로 떠나볼까요?</h2>

        <Slider key={sliderKey} {...(isMobile ? mobileSettings : pcSettings)}>
          {majorRegions.map((region) => (
            <div key={region.name}>
              <div className="region-slide-item">
                <Link to={region.url}>
                  <img src={region.image} alt={region.name} className="region-image" />
                  <div className="region-name-overlay">
                    <span>{region.name}</span>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default RegionCarousel;
