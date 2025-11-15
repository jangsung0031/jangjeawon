import React from 'react';
import MapContainer from './MapContainer';

const MapView = ({ schedule, selectedDay, setSelectedDay }) => {
    return (
        <div className="map-view-wrapper">
            {schedule?.length > 0 && (
                <div className="day-selector">
                    <button onClick={() => setSelectedDay(0)} className={selectedDay === 0 ? 'active' : ''}>
                        전체
                    </button>
                    {schedule.map(dayPlan => (
                        <button 
                            key={dayPlan.day} 
                            onClick={() => setSelectedDay(dayPlan.day)}
                            className={selectedDay === dayPlan.day ? 'active' : ''}
                        >
                            {dayPlan.day}일차
                        </button>
                    ))}
                </div>
            )}
            <MapContainer schedule={schedule} selectedDay={selectedDay} />
        </div>
    );
};

export default MapView;