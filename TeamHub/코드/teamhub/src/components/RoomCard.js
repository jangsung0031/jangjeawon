import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/RoomIntro.css";
function RoomCard({ room }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/rooms/${room.id}`);
  };

  return (
    <div className="intro-room-card" onClick={handleClick}>
      <img src={room.image} alt={room.name} className="intro-room-image" />
      <h3>{room.name}</h3>
      <p>{room.description}</p>
      <p className="price">{room.price}</p>
    </div>
  );
}

export default RoomCard;

