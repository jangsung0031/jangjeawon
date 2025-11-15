import React from 'react';
import { useNavigate } from 'react-router-dom';
import activities from './activityData';
import './Activity.css';


function ActivityList() {
  const navigate = useNavigate();

  return (
    <div className="card-grid">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="activity-card"
          onClick={() => navigate(`/activities/${activity.id}`)}
        >
          <img src={activity.image} alt={activity.title} />
          <div className="content">
            <h3>{activity.title}</h3>
            <div className="tags">{activity.tags}</div>
            <div className="desc">{activity.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityList;
