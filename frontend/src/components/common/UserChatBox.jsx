import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { FaComments, FaTimes, FaPaperPlane } from 'react-icons/fa';
import '../../styles/UserChatBox.css';

const ADMIN_EMAIL = 'vuhongthu13062004@gmail.com';

const UserChatBox = ({ userEmail, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketInitializedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket will be initialized only when first message is sent
  // No need to initialize on chat box open

  // Cleanup on component unmount only
  useEffect(() => {
    return () => {
      if (stompClientRef.current?.connected) {
        console.log('=== Component unmounting, sending LEAVE and closing socket');
        stompClientRef.current.publish({
          destination: '/app/chat.leave',
          body: JSON.stringify({
            sender: userEmail,
            senderName: userName || userEmail,
            recipient: ADMIN_EMAIL,
            type: 'LEAVE'
          })
        });
        stompClientRef.current.deactivate();
      }
    };
  }, [userEmail, userName]);

  const initializeSocket = () => {
    if (socketInitializedRef.current && stompClientRef.current?.connected) {
      console.log('=== Socket already initialized');
      setConnected(true);
      return;
    }

    // Khởi tạo WebSocket connection
    const socket = new SockJS('http://localhost:8080/api/chat-websocket');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      onConnect: () => {
        console.log('Connected to WebSocket');
        setConnected(true);

        // Subscribe to personal topic for messages
        stompClient.subscribe(`/topic/chat/${userEmail}`, (message) => {
          const chatMessage = JSON.parse(message.body);
          console.log('Message received:', chatMessage);
          
          // Add message only once
          setMessages((prev) => {
            // Check if message already exists (prevent duplicate)
            const isDuplicate = prev.some(msg => 
              msg.content === chatMessage.content && 
              msg.timestamp === chatMessage.timestamp &&
              msg.sender === chatMessage.sender
            );
            if (isDuplicate) {
              return prev;
            }
            return [...prev, chatMessage];
          });

          // Increment unreadCount only if message is from admin and chat box is not open
          if (chatMessage.sender === ADMIN_EMAIL && !isOpen) {
            setUnreadCount((prev) => prev + 1);
          }
        });

        // Send join notification
        stompClient.publish({
          destination: '/app/chat.join',
          body: JSON.stringify({
            sender: userEmail,
            senderName: userName || userEmail,
            recipient: ADMIN_EMAIL,
            type: 'JOIN'
          })
        });
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
        setConnected(false);
        socketInitializedRef.current = false;
      },
      onStompError: (frame) => {
        console.error('STOMP error: ', frame);
        socketInitializedRef.current = false;
      }
    });

    stompClient.activate();
    stompClientRef.current = stompClient;
    socketInitializedRef.current = true;
  };

  const loadChatHistory = async () => {
    try {
      console.log('=== Loading chat history for user:', userEmail);
      const response = await fetch(
        `http://localhost:8080/api/chat/history?user1=${userEmail}&user2=${ADMIN_EMAIL}`
      );
      if (response.ok) {
        const history = await response.json();
        console.log('=== Loaded chat history:', history.length, 'messages');
        console.log('=== History data:', history);
        setMessages(history);
      } else {
        console.error('=== Failed to load history, status:', response.status);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleClose = () => {
    console.log('=== Closing chat box (keeping socket alive)');
    // NOT sending LEAVE here - just close the UI
    // Socket will stay alive for reconnection
    // Mark all messages as read
    setUnreadCount(0);
    setIsOpen(false);
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    // Initialize socket on first message if not already initialized
    if (!stompClientRef.current?.connected && !socketInitializedRef.current) {
      console.log('=== First message: initializing socket');
      initializeSocket();
      // Wait a moment for socket to connect before sending
      setTimeout(() => {
        sendMessageContent();
      }, 500);
    } else if (stompClientRef.current?.connected) {
      sendMessageContent();
    }
  };

  const sendMessageContent = () => {
    const chatMessage = {
      sender: userEmail,
      senderName: userName || userEmail,
      recipient: ADMIN_EMAIL,
      content: inputMessage,
      type: 'MESSAGE',
      timestamp: new Date().toISOString()
    };

    stompClientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(chatMessage)
    });

    // Mark as read when user sends message
    setUnreadCount(0);
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        className="chat-toggle-button"
        onClick={() => {
          setIsOpen(true);
          // Load history when opening chat for the first time
          if (messages.length === 0) {
            loadChatHistory();
          }
        }}
        title="Chat với Admin"
      >
        <FaComments size={24} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {/* Chat box */}
      {isOpen && (
        <div className="user-chat-box">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <h4>Admin Support</h4>
            </div>
            <button className="close-button" onClick={handleClose}>
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-messages">
                <p>Chào bạn! Hãy gửi tin nhắn để bắt đầu trò chuyện với Admin.</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.sender === userEmail ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    <p>{msg.content}</p>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              className="send-button"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserChatBox;
