import React, { useState, useEffect } from 'react';
import apiClient from '../../module/apiClient';
import '../../css/AiChat.css';
import ChatPanel from './ChatPanel';
import PlanBoard from './PlanBoard';
import { FiCoffee, FiCamera, FiSmile } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const travelStyles = [
    { key: '맛집 탐방', icon: <FiCoffee />, label: '맛집 탐방' },
    { key: '여유로운 힐링', icon: <FiSmile />, label: '여유로운 힐링' },
    { key: '관광&인생샷', icon: <FiCamera />, label: '관광&인생샷' }
];

const AiPlanner = () => {
    const [chatHistory, setChatHistory] = useState([]);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [schedule, setSchedule] = useState([]);
    
    const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const [authChecked, setAuthChecked] = useState(false);

        useEffect(() => {
            const token = sessionStorage.getItem('token');
            if (!token) {
                alert('회원만 이용 가능한 페이지입니다. 로그인 해주세요.');
                navigate('/login', { replace: true, state: { from: location.pathname } });
                return;
            }
            setAuthChecked(true);
            }, [navigate, location]);

    useEffect(() => {
        document.body.classList.add('ai-planner-page');
        return () => {
            document.body.classList.remove('ai-planner-page');
        };
    }, []);

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const response = await apiClient.get('/api/chat/history');
                setChatHistory(response.data);
            } catch (error) {
                console.error("채팅 목록 로딩 실패:", error);
            }
        };
        fetchChatHistory();
    }, []);

    const resetChatState = (clearRoomId = false) => {
        if (clearRoomId) {
            setCurrentRoomId(null);
            setSelectedStyle(null);
        }
        setMessages([]);
        setSchedule([]);
    };

    const handleStyleSelect = (styleKey) => {
        setSelectedStyle(styleKey);
        setIsStyleModalOpen(false);
        if (!currentRoomId) {
            setCurrentRoomId('new-chat-ready');
        }
    };

    const handleSelectChat = async (chatroomId) => {
        if (currentRoomId === chatroomId) return;
        resetChatState();
        setSelectedStyle(null);
        setCurrentRoomId(chatroomId);
        setIsLoading(true);
        try {
            const response = await apiClient.get(`/api/chat/messages/${chatroomId}`);
            const loadedMessages = response.data;
            setMessages(loadedMessages);
            const lastAiMessage = [...loadedMessages].reverse().find(msg => msg.actor === 'ai' && msg.schedule?.length > 0);
            if (lastAiMessage) {
                setSchedule(lastAiMessage.schedule);
            }
        } catch (error) {
            console.error("메시지 로딩 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        resetChatState(true);
        setIsStyleModalOpen(true);
    };

    const handleSendMessage = async () => {
        if (!currentRoomId) {
            alert('새 채팅을 시작하거나 기존 대화를 선택해주세요.');
            return;
        }
        
        if (!userInput.trim() || isLoading) return;
        
        const question = userInput;
        const userMessage = {
            messageId: Date.now(), content: question,
            actor: 'user', datetime: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);
        
        const chatroomIdToSend = currentRoomId === 'new-chat-ready' ? null : currentRoomId;

        try {
            const response = await apiClient.post('/api/chat/ask-ai', {
                question: question, 
                chatroomId: chatroomIdToSend,
                travelStyle: selectedStyle
            });
            const aiMessage = response.data;
            
            if (chatroomIdToSend === null && aiMessage.chatroomId) {
                setCurrentRoomId(aiMessage.chatroomId);
                const newChatItem = {
                    chatroomId: aiMessage.chatroomId,
                    title: question.substring(0, 20),
                    createdAt: new Date().toISOString()
                };
                setChatHistory(prev => [newChatItem, ...prev]);
            }

            setMessages(prev => [...prev.filter(msg => msg.actor !== 'error'), aiMessage]);
            if (aiMessage.schedule && aiMessage.schedule.length > 0) {
                setSchedule(aiMessage.schedule);
            }
        } catch (error) {
            console.error("메시지 전송 실패:", error);
            const errorMsg = {
                messageId: Date.now(), content: "오류가 발생했습니다. 다시 시도해주세요.",
                actor: 'error', datetime: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="planner-container">
            {isStyleModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>어떤 스타일의 여행을 원하세요?</h2>
                        <div className="style-button-group">
                            {travelStyles.map(style => (
                                <button key={style.key} onClick={() => handleStyleSelect(style.key)} className="style-button">
                                    <span className="style-icon">{style.icon}</span>
                                    <span className="style-label">{style.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <ChatPanel
                messages={messages}
                userInput={userInput}
                setUserInput={setUserInput}
                isLoading={isLoading}
                handleSendMessage={handleSendMessage}
                chatHistory={chatHistory}
                currentRoomId={currentRoomId}
                handleSelectChat={handleSelectChat}
                handleNewChat={handleNewChat}
            />
            <PlanBoard
                schedule={schedule}
                messages={messages}
            />
        </div>
    );
};

export default AiPlanner;