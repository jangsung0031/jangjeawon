import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FiMenu, FiSend } from 'react-icons/fi';

const ChatPanel = ({
    messages,
    userInput,
    setUserInput,
    isLoading,
    handleSendMessage,
    chatHistory,
    currentRoomId,
    handleSelectChat,
    handleNewChat,
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const sidebarRef = useRef(null);
    // hamburgerRef는 더 이상 바깥 클릭 감지에 필요하지 않으므로 제거해도 됩니다.

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        // 사이드바 바깥을 클릭하면 닫히는 기능
        const handleClickOutside = (event) => {
            if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);

    const onSendMessage = (e) => {
        e.preventDefault();
        handleSendMessage();
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            onSendMessage(e);
        }
    };

    return (
        <div className="chat-panel">
            {/* 투명 오버레이는 바깥 클릭 감지를 위해 그대로 둡니다. */}
            <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}></div>
            
            <aside ref={sidebarRef} className={`ai-chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button className="new-chat-btn" onClick={handleNewChat}>⊕ 새 채팅</button>
                <div className="sidebar-history">
                    <p className="history-title">최근 대화</p>
                    <ul className="history-list">
                        {chatHistory.map((chat) => (
                            <li key={chat.chatroomId} className={`history-item ${chat.chatroomId === currentRoomId ? 'active' : ''}`} onClick={() => handleSelectChat(chat.chatroomId)}>
                                {chat.title}
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            <div className="chat-area">
                <div className="chat-header">
                    {/* --- 수정된 부분 --- */}
                    {/* isSidebarOpen이 false일 때만 햄버거 메뉴가 보입니다. */}
                    {!isSidebarOpen && (
                        <div className="hamburger-menu" onClick={toggleSidebar}>
                            <FiMenu size={24} />
                        </div>
                    )}
                    <span>AI 여행 플래너</span>
                </div>
                <div className="chat-messages">
                    {messages.map((msg) => (
                        <div key={msg.messageId} className={`message-bubble ${msg.actor}`}>
                            <ReactMarkdown components={{ p: 'span' }}>{msg.content}</ReactMarkdown>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message-bubble ai loading">
                            기다리는 중<span>.</span><span>.</span><span>.</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form className="chat-input-form" onSubmit={onSendMessage}>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="예: 제주도 3박 4일 여행 계획 짜줘"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading}><FiSend /></button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;