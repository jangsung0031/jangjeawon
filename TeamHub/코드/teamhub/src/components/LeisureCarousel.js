import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./LeisureCarousel.css";

const LeisureCarousel = () => {
  const images = [
    "/images/test1.jpg",
    "/images/test2.jpg",
    "/images/test3.jpg",
    "/images/test4.jpg",
    "/images/test5.jpg",
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {images.map((src, idx) => (
          <div key={idx}>
            <img src={src} alt={`slide-${idx}`} className="carousel-image" />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default LeisureCarousel;
