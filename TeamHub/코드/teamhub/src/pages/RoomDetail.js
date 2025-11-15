import React from "react";
import { useParams } from "react-router-dom";
import roomData from "../data/RoomData";
import "../css/RoomDetail.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

function RoomDetail() {
  const { id } = useParams();
  const room = roomData.find((room) => room.id === parseInt(id));

  if (!room) {
    return <p>존재하지 않는 객실입니다.</p>;
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="room-detail-container">
      {room.imageList && room.imageList.length > 0 ? (
        <Slider {...settings}>
          {room.imageList.map((img, i) => (
            <div key={i}>
              <img src={img} alt={`${room.name} 이미지 ${i + 1}`} className="room-detail-image" />
            </div>
          ))}
        </Slider>
      ) : (
        <img src={room.image} alt={room.name} className="room-detail-image" />
      )}

      <h2>{room.name}</h2>
      <p className="room-detail-type">{room.type}</p>
      <p className="room-detail-desc">{room.description}</p>
      <p className="room-detail-price">{room.price}</p>

      <div className="room-detail-boxes">
        <div className="room-detail-box">
  <h4>객실 수영장 사용 시 안내사항</h4>
  {Array.isArray(room.location) ? (
    <ul>
      {room.location.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  ) : (
    <p>{room.location}</p>
  )}
</div>
        <div className="room-detail-box">
          <h4>편의시설</h4>
          <ul>
            {room.facilities.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="room-detail-box">
          <h4>이용안내</h4>
          <ul>
            {room.notices.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default RoomDetail;
