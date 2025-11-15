import { Link } from 'react-router-dom';

function ActivityCard({ activity }) {
  return (
    <Link to={`/activities/${activity.id}`} className="activity-card">
      <img src={activity.image} alt={activity.title} />
      <div className="content">
        <h3>{activity.title}</h3>
        <div className="tags">{activity.category} | {activity.location}</div>
        <div className="desc">{activity.shortDesc}</div>
      </div>
    </Link>
  );
}

export default ActivityCard;
