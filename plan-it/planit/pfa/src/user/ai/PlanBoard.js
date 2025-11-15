import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import MapContainer from './MapContainer';
import { FiPrinter, FiMaximize, FiX } from 'react-icons/fi';

const PlanBoard = ({ schedule, messages }) => {
    const [selectedDay, setSelectedDay] = useState(0);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    
    const lastAiMessage = [...messages].reverse().find(msg => msg.actor === 'ai');
    const planContent = lastAiMessage ? lastAiMessage.content : "AI와 대화를 시작하여 여행 계획을 만들어보세요.";

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            {isMapModalOpen && (
                <div className="map-modal-overlay" onClick={() => setIsMapModalOpen(false)}>
                    <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-map-modal-btn" onClick={() => setIsMapModalOpen(false)}>
                            <FiX size={24} />
                        </button>
                        
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
                </div>
            )}

            <div className="plan-board">
                <div className="plan-content-area">
                    <div className="plan-header">
                        <h2>여행 계획 보드</h2>
                        {schedule && schedule.length > 0 && (
                            <button className="print-btn" onClick={handlePrint} title="이 계획 인쇄/PDF 저장">
                                <FiPrinter />
                            </button>
                        )}
                    </div>
                    <div className="plan-details">
                        <ReactMarkdown>{planContent}</ReactMarkdown>
                    </div>
                </div>
                <div className="plan-map-area">
                    <button className="enlarge-map-btn" onClick={() => setIsMapModalOpen(true)} title="지도 크게 보기">
                        <FiMaximize />
                    </button>

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
            </div>
        </>
    );
};

export default PlanBoard;