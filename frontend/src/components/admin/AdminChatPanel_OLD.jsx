import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { FaComments, FaTimes, FaPaperPlane, FaUser } from 'react-icons/fa';
import '../../styles/AdminChatPanel.css';

const ADMIN_EMAIL = 'vuhongthu13062004@gmail.com';

const AdminChatPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSessions, setActiveSessions] = useState(new Map());
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedUser, activeSessions]);

  useEffect(() => {
    // Khởi tạo WebSocket connection - use relative path so protocol (wss/http) matches page
    const socket = new SockJS('/api/chat-websocket');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      onConnect: () => {
        console.log('Admin connected to WebSocket');
        setConnected(true);

        // Subscribe to admin's personal topic for notifications and messages
        stompClient.subscribe(`/topic/chat/${ADMIN_EMAIL}`, (message) => {
          const notification = JSON.parse(message.body);
          console.log('Received:', notification);

          if (notification.type === 'JOIN') {
            // Add new user session and load their chat history
            loadChatHistory(notification.sender).then((history) => {
              setActiveSessions((prev) => {
                const newSessions = new Map(prev);
                newSessions.set(notification.sender, {
                  userEmail: notification.sender,
                  userName: notification.senderName,
                  messages: history, // Load history from DB
                  sessionId: notification.sessionId,
                  unreadCount: 0
                });
                return newSessions;
              });
            });
          } else if (notification.type === 'LEAVE') {
            // Remove user session
            setActiveSessions((prev) => {
              const newSessions = new Map(prev);
              newSessions.delete(notification.sender);
              return newSessions;
            });
            // Deselect if this was the selected user
            if (selectedUser === notification.sender) {
              setSelectedUser(null);
            }
          } else if (notification.type === 'MESSAGE') {
            // Add message to the appropriate user's session
            setActiveSessions((prev) => {
              const newSessions = new Map(prev);
              const userEmail = notification.sender === ADMIN_EMAIL ? notification.recipient : notification.sender;
              
              if (newSessions.has(userEmail)) {
                const session = newSessions.get(userEmail);
                
                // Check for duplicate messages
                const isDuplicate = session.messages.some(msg =>
                  msg.content === notification.content &&
                  msg.timestamp === notification.timestamp &&
                  msg.sender === notification.sender
                );
                
                if (!isDuplicate) {
                  session.messages = [...session.messages, notification];
                  // Increment unreadCount only for messages from user (not admin)
                  if (notification.sender !== ADMIN_EMAIL) {
                    session.unreadCount = (session.unreadCount || 0) + 1;
                  }
                  newSessions.set(userEmail, session);
                }
              }
              return newSessions;
            });
          }
        });

        // Send join for admin
        stompClient.publish({
          destination: '/app/chat.join',
          body: JSON.stringify({
            sender: ADMIN_EMAIL,
            senderName: 'Admin',
            type: 'JOIN'
          })
        });
      },
      onDisconnect: () => {
        console.log('Admin disconnected from WebSocket');
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error: ', frame);
      }
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  const sendMessage = () => {
    if (!inputMessage.trim() || !connected || !selectedUser) return;

    const chatMessage = {
      sender: ADMIN_EMAIL,
      senderName: 'Admin',
      recipient: selectedUser,
      content: inputMessage,
      type: 'MESSAGE',
      timestamp: new Date().toISOString()
    };

    stompClientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(chatMessage)
    });

    // Mark as read when admin sends message
    setActiveSessions((prev) => {
      const newSessions = new Map(prev);
      if (newSessions.has(selectedUser)) {
        const session = newSessions.get(selectedUser);
        session.unreadCount = 0;
        newSessions.set(selectedUser, session);
      }
      return newSessions;
    });

    setInputMessage('');
  };

  const markAsRead = (userEmail) => {
    setActiveSessions((prev) => {
      const newSessions = new Map(prev);
      if (newSessions.has(userEmail)) {
        const session = newSessions.get(userEmail);
        session.unreadCount = 0;
        newSessions.set(userEmail, session);
      }
      return newSessions;
    });
  };

  const loadChatHistory = async (userEmail) => {
    try {
      // Use relative API path so calls follow current origin/protocol (HTTPS in production)
      const response = await fetch(
        `/api/chat/history?user1=${ADMIN_EMAIL}&user2=${userEmail}`
      );
      if (response.ok) {
        const history = await response.json();
        console.log('=== Loaded chat history for', userEmail, ':', history.length, 'messages');
        return history;
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    return [];
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

  const selectedSession = selectedUser ? activeSessions.get(selectedUser) : null;

  return (
    <>
      {/* Chat toggle button */}
      <button
        className={`admin-chat-toggle ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        title="Hỗ trợ khách hàng"
      >
        <FaComments size={24} />
        {activeSessions.size > 0 && (
          <span className="badge">{activeSessions.size}</span>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="admin-chat-panel">
          {/* Header */}
          <div className="admin-chat-header">
            <h4>Hỗ trợ khách hàng</h4>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>

          <div className="admin-chat-content">
            {/* User list */}
            <div className="user-list">
              <div className="user-list-header">
                <h5>Người dùng đang chat ({activeSessions.size})</h5>
              </div>
              <div className="user-list-items">
                {activeSessions.size === 0 ? (
                  <div className="empty-user-list">
                    <p>Chưa có người dùng nào đang chat</p>
                  </div>
                ) : (
                  Array.from(activeSessions.values()).map((session) => (
                    <div
                      key={session.userEmail}
                      className={`user-item ${selectedUser === session.userEmail ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedUser(session.userEmail);
                        markAsRead(session.userEmail);
                      }}
                    >
                      <div className="user-avatar">
                        <FaUser />
                      </div>
                      <div className="user-info">
                        <div className="user-name">{session.userName}</div>
                        <div className="user-email">{session.userEmail}</div>
                      </div>
                      {session.unreadCount > 0 && (
                        <span className="unread-badge">{session.unreadCount}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className="chat-area">
              {selectedSession ? (
                <>
                  {/* Chat header */}
                  <div className="chat-area-header">
                    <div className="user-avatar">
                      <FaUser />
                    </div>
                    <div>
                      <div className="user-name">{selectedSession.userName}</div>
                      <div className="user-email">{selectedSession.userEmail}</div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="chat-messages">
                    {selectedSession.messages.length === 0 ? (
                      <div className="empty-messages">
                        <p>Chưa có tin nhắn nào</p>
                      </div>
                    ) : (
                      selectedSession.messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`message ${msg.sender === ADMIN_EMAIL ? 'sent' : 'received'}`}
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
                      disabled={!connected || !inputMessage.trim()}
                      className="send-button"
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-user-selected">
                  <FaComments size={48} />
                  <p>Chọn một người dùng để bắt đầu trò chuyện</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminChatPanel;
