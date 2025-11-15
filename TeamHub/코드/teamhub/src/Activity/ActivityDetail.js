import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import activities from './activityData';
import './Activity.css';

function ActivityDetail() {
  const { id } = useParams();
  const activity = activities.find(act => act.id === parseInt(id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!activity) return <div>해당 활동을 찾을 수 없습니다.</div>;

  return (
    <div className="activity-detail-container">
      <img className="detail-img" src={activity.image} alt={activity.title} />
      <h2>{activity.title}</h2>
      <div className="tags">{activity.tags}</div>
      <div className="desc">{activity.desc}</div>

      <div className="activity-detail-info">
        <div className="left">
          <h4>위치</h4>
          <pre>{activity.location}</pre>
          <h4>문의처</h4>
          <pre>{activity.contact}</pre>
          <h4>운영시간</h4>
          <pre>{activity.hours}</pre>
        </div>
        <div className="right">
          <h4>이용안내</h4>
          <pre>{activity.guide}</pre>
        </div>
      </div>

      {activity.priceInfo && (
        <div className="price-info">
          <h3>이용요금 <span style={{ fontSize: '14px', color: '#888' }}>(VAT 포함"현장결제만 가능")</span></h3>
          <ul className="price-list">
            {activity.priceInfo.map((item, idx) => (
              <li key={idx} className="price-row">
                <div>
                  <div>{item.label}</div>
                  {item.note && <small style={{ color: '#777' }}>{item.note}</small>}
                </div>
                <strong>{item.price}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ActivityDetail;
