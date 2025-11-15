import React, {useEffect} from "react";
import { useParams } from "react-router-dom";
import { leisureDetails } from "./LeisureData";
import "../css/LeisureDetail.css";

function LeisureDetail() {
  const { name } = useParams();
  const detail = leisureDetails[name];

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  if (!detail) return <p>존재하지 않는 레저입니다.</p>;

  const { description, info, image } = detail;

  return (
    <div className="leisure-detail-container">
      <img src={image} alt={name} className="detail-image" />
      <h2>{name}</h2>
      <p className="desc">{description}</p>
      <ul className="info-list">
        {Object.entries(info).map(([key, value]) => (
          <li key={key}><strong>{key}</strong>: {value}</li>
        ))}
      </ul>
    </div>
  );
}

export default LeisureDetail;
