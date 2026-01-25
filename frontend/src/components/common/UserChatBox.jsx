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
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketInitializedRef = useRef(false);
  const isOpenRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (stompClientRef.current?.connected) {
        console.log('=== Component unmounting, closing socket');
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

    console.log('=== Initializing WebSocket connection');
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
          
          if (chatMessage.type === 'MESSAGE') {
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
            if (chatMessage.sender === ADMIN_EMAIL && !isOpenRef.current) {
              setUnreadCount((prev) => prev + 1);
            } else if (chatMessage.sender === ADMIN_EMAIL && isOpenRef.current) {
              // If chat is open, update lastSeen
              const lastSeenKey = `chat_lastSeen_${userEmail}_${ADMIN_EMAIL}`;
              localStorage.setItem(lastSeenKey, new Date().toISOString());
            }
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

        // Load unread count from localStorage on connect
        checkUnreadMessages();
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

  // Check for unread messages from backend
  const checkUnreadMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/chat/last-50?user1=${userEmail}&user2=${ADMIN_EMAIL}`
      );
      if (response.ok) {
        const allMessages = await response.json();
        
        // Get last seen timestamp from localStorage
        const lastSeenKey = `chat_lastSeen_${userEmail}_${ADMIN_EMAIL}`;
        let lastSeenTimestamp = localStorage.getItem(lastSeenKey);
        
        if (allMessages.length > 0) {
          // If no lastSeen timestamp, initialize it with the oldest message timestamp
          // allMessages is sorted DESC (newest first), so oldest is at the end
          if (!lastSeenTimestamp) {
            const oldestMessage = allMessages[allMessages.length - 1];
            const oldestMessageTime = new Date(oldestMessage.timestamp);
            lastSeenTimestamp = oldestMessageTime.toISOString();
            localStorage.setItem(lastSeenKey, lastSeenTimestamp);
            console.log('=== Initialized lastSeen with oldest message time:', oldestMessageTime);
          }
          
          // Count messages from admin that are newer than lastSeen
          const unreadMessages = allMessages.filter(msg => 
            msg.sender === ADMIN_EMAIL && 
            new Date(msg.timestamp) > new Date(lastSeenTimestamp)
          );
          
          if (unreadMessages.length > 0) {
            setUnreadCount(unreadMessages.length);
            console.log('=== Found', unreadMessages.length, 'unread messages');
          }
        }
      }
    } catch (error) {
      console.error('Error checking unread messages:', error);
    }
  };

  // Load chat history từ DB khi mở chat (chỉ load 1 lần)
  const loadChatHistory = async () => {
    try {
      console.log('=== Loading chat history (last 50 messages) for user:', userEmail);
      const response = await fetch(
        `http://localhost:8080/api/chat/last-50?user1=${userEmail}&user2=${ADMIN_EMAIL}`
      );
      if (response.ok) {
        const history = await response.json();
        console.log('=== Loaded', history.length, 'messages from DB');
        setMessages(history);
        setHistoryLoaded(true);
      } else {
        console.error('=== Failed to load history, status:', response.status);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleOpen = async () => {
    console.log('=== Opening chat box');
    setIsOpen(true);
    isOpenRef.current = true;
    setUnreadCount(0); // Reset unread count when opening
    
    // Load history first time (chỉ load 1 lần)
    if (!historyLoaded) {
      await loadChatHistory();
    }
    
    // Save lastSeen timestamp to localStorage
    const lastSeenKey = `chat_lastSeen_${userEmail}_${ADMIN_EMAIL}`;
    localStorage.setItem(lastSeenKey, new Date().toISOString());
    
    // Initialize socket for realtime messages
    initializeSocket();
    setTimeout(scrollToBottom, 150);
  };

  const handleClose = () => {
    console.log('=== Closing chat box (keeping socket alive for realtime)');
    setIsOpen(false);
    isOpenRef.current = false;
    // Socket vẫn chạy để nhận tin nhắn từ admin và cập nhật unread count
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    // Initialize socket on first message if not already initialized
    if (!stompClientRef.current?.connected) {
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

    // Update lastSeen timestamp when sending message
    const lastSeenKey = `chat_lastSeen_${userEmail}_${ADMIN_EMAIL}`;
    localStorage.setItem(lastSeenKey, new Date().toISOString());

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

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentDate = null;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.timestamp);
      const dateString = msgDate.toLocaleDateString('vi-VN');

      if (dateString !== currentDate) {
        currentDate = dateString;
        const today = new Date().toLocaleDateString('vi-VN');
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('vi-VN');

        let displayDate;
        if (dateString === today) {
          displayDate = 'Hôm nay';
        } else if (dateString === yesterday) {
          displayDate = 'Hôm qua';
        } else {
          displayDate = dateString;
        }

        groups.push({ type: 'date', date: displayDate });
      }
      groups.push({ type: 'message', data: msg });
    });

    return groups;
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        className="chat-toggle-button"
        onClick={handleOpen}
        title="Chat với Admin"
      >
        <FaComments size={24} />
        {unreadCount > 0 && (
          <span className="notification-dot" />
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
              groupMessagesByDate(messages).map((item, index) => {
                if (item.type === 'date') {
                  return (
                    <div key={`date-${index}`} className="date-divider">
                      <span>{item.date}</span>
                    </div>
                  );
                } else {
                  const msg = item.data;
                  return (
                    <div
                      key={`msg-${index}`}
                      className={`message ${msg.sender === userEmail ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <p>{msg.content}</p>
                        <span className="message-time">{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  );
                }
              })
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
