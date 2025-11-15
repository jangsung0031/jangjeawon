import React from "react";
import "../../css/main/TravelCard.css";

const TravelCard = ({ image, title, description }) => {
  return (
    <div className="travel-card">
      <img src={image} alt={title} className="card-image" />
      <div className="card-overlay">
        <div className="card-content">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
};

export default TravelCard;
