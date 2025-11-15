import React from "react";
import RoomCard from "../components/RoomCard";
import roomData from "../data/RoomData";
import "../css/RoomIntro.css";

function RoomIntro() {
  return (
    <div className="room-intro-container" style={{ marginTop: "100px" }}>
      <h2 className="room-intro-title">객실 소개</h2>
      <div className="room-list">
        {roomData.map((room) => (
          <RoomCard key={room.id} room={room} className="intro-room-card" imageClass="intro-room-image" />
        ))}
      </div>
    </div>
  );
}

export default RoomIntro;
