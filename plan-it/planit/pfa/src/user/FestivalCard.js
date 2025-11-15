import React from "react";
import { Link } from "react-router-dom";

function FestivalCard({ festival }) {
  return (
    <div style={styles.card}>
      <img src={festival.image} alt={festival.title} style={styles.image} />
      <h3>{festival.title}</h3>
      <p>{festival.startDate} ~ {festival.endDate}</p>
      <Link to={`/user/festival/${festival.id}`}>자세히 보기</Link>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    margin: "10px",
    width: "200px",
    textAlign: "center"
  },
  image: { width: "100%", height: "120px", objectFit: "cover" }
};

export default FestivalCard;
