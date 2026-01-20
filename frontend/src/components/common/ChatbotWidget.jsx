import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatbotWidget.css';

/**
 * ChatbotWidget Component
 * Floating chatbot widget for home page
 * Allows users to interact with AI-powered chatbot
 */
const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Xin chào! 👋 Tôi là assistant của MentorLink. Tôi có thể giúp bạn tìm mentor phù hợp, trả lời câu hỏi về các dịch vụ, chính sách, và thông tin booking. Bạn cần gì?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Send message to backend chatbot API
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      return;
    }

    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Call backend chatbot API
      const response = await axios.post(
        `${API_BASE_URL}/chatbot/chat`,
        {
          message: inputValue,
          userId: null, // Can be set if user is logged in
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      const { message: botMessage, recommendedMentors, confidence } = response.data;

      // Add bot response
      const assistantMessage = {
        id: messages.length + 2,
        text: botMessage,
        sender: 'bot',
        timestamp: new Date(),
        mentors: recommendedMentors || [],
        confidence: confidence || 0,
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Error sending message:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMsg = 'Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn.';
      
      if (err.response?.status === 400) {
        errorMsg = 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.';
      } else if (err.response?.status === 500) {
        errorMsg = 'Lỗi máy chủ. Vui lòng thử lại sau.';
      } else if (err.code === 'ECONNABORTED') {
        errorMsg = 'Kết nối hết thời gian chờ. Backend có thể chưa sẵn sàng.';
      }
      
      setError(errorMsg);

      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        text: errorMsg,
        sender: 'bot',
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);

    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render mentor recommendations
   */
  const renderMentorRecommendations = (mentors) => {
    if (!mentors || mentors.length === 0) {
      return null;
    }

    return (
      <div className="mentor-recommendations">
        <h4>📌 Gợi ý Mentor:</h4>
        {mentors.map((mentor) => (
          <div key={mentor.mentorId} className="mentor-card">
            <div className="mentor-header">
              <h5>{mentor.name}</h5>
              <span className="rating">⭐ {mentor.rating.toFixed(1)}</span>
            </div>
            <p className="expertise">{mentor.expertise}</p>
            <p className="reason">{mentor.reason}</p>
            <button className="view-profile-btn">Xem Hồ Sơ</button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="chatbot-widget">
      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="header-content">
            <h3>🤖 MentorLink Assistant</h3>
            <p>Trợ lý thông minh của bạn</p>
          </div>
          <button
            className="close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng chat"
          >
            ✕
          </button>
        </div>

        {/* Messages Container */}
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-bubble">
                <p>{message.text}</p>
                {message.mentors && renderMentorRecommendations(message.mentors)}
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message bot">
              <div className="message-bubble loading">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form className="input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            disabled={isLoading}
            className="message-input"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="send-btn"
            aria-label="Gửi tin nhắn"
          >
            {isLoading ? '...' : '➤'}
          </button>
        </form>
      </div>

      {/* Float Button */}
      {!isOpen && (
        <button
          className="chatbot-float-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Mở chat"
          title="Hỏi trợ lý AI"
        >
          💬
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;
