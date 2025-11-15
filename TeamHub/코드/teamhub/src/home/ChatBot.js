import React, { useState, useEffect, useRef } from 'react';
import faqData from '../data/faqData';
import '../css/ChatBotFloat.css';

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);

  useEffect(() => {
    setMessages([{ type: 'bot', text: '안녕하세요! 무엇을 도와드릴까요?' }]);
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelect = (faq) => {
    setMessages((prev) => [
      ...prev,
      { type: 'user', text: faq.question },
      { type: 'bot', text: faq.answer }
    ]);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">💬 TeamHub 상담봇</div>

      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.type}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div className="chatbot-options">
        {faqData.map((faq, index) => (
          <button
            key={index}
            className="chatbot-option-button"
            onClick={() => handleSelect(faq)}
          >
            {faq.question}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChatBot;
