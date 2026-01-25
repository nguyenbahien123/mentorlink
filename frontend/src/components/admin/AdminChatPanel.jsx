import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { FaComments, FaTimes, FaPaperPlane, FaUser } from 'react-icons/fa';
import '../../styles/AdminChatPanel.css';

const ADMIN_EMAIL = 'vuhongthu13062004@gmail.com';

const AdminChatPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]); // danh sách cuộc trò chuyện
  const [activeSessions, setActiveSessions] = useState(new Map()); // cache messages theo user
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedUserRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedUser, activeSessions]);

  useEffect(() => {
    // Initialize WebSocket connection
    const socket = new SockJS('http://localhost:8080/api/chat-websocket');
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

          if (notification.type === 'MESSAGE') {
            const userEmail = notification.sender === ADMIN_EMAIL ? notification.recipient : notification.sender;

            // Update cache messages
            setActiveSessions((prev) => {
              const newSessions = new Map(prev);
              const session = newSessions.get(userEmail) || { userEmail, userName: userEmail, messages: [], unreadCount: 0 };

              const isDuplicate = session.messages.some(msg =>
                msg.content === notification.content &&
                msg.timestamp === notification.timestamp &&
                msg.sender === notification.sender
              );

              if (!isDuplicate) {
                session.messages = [...session.messages, notification];
                if (notification.sender !== ADMIN_EMAIL && selectedUserRef.current !== userEmail) {
                  // If message is from user and user is not currently selected, increment unread
                  session.unreadCount = (session.unreadCount || 0) + 1;
                } else if (notification.sender !== ADMIN_EMAIL && selectedUserRef.current === userEmail) {
                  // If user is selected, update lastSeen
                  const lastSeenKey = `chat_lastSeen_${ADMIN_EMAIL}_${userEmail}`;
                  localStorage.setItem(lastSeenKey, new Date().toISOString());
                }
                newSessions.set(userEmail, session);
              }
              return newSessions;
            });

            // Refresh conversations list order by last time
            refreshConversations();
          }
        });

        // Send join for admin
        stompClient.publish({
          destination: '/app/chat.join',
          body: JSON.stringify({
            sender: ADMIN_EMAIL,
            senderName: 'Admin',
            recipient: 'all',
            type: 'JOIN'
          })
        });

        // Load unread counts from all conversations
        checkUnreadMessages();
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
      if (stompClientRef.current?.connected) {
        console.log('Cleaning up WebSocket');
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  // Load conversations for admin (lịch sử cuộc trò chuyện)
  const refreshConversations = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/chat/conversations?userEmail=${ADMIN_EMAIL}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Error loading conversations', err);
    }
  };

  useEffect(() => {
    refreshConversations();
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshConversations();
      setTimeout(scrollToBottom, 150);
    }
  }, [isOpen]);

  // Load last 50 messages for a user
  const loadChatHistory = async (userEmail) => {
    try {
      console.log('=== Loading chat history for:', userEmail);
      const response = await fetch(
        `http://localhost:8080/api/chat/last-50?user1=${userEmail}&user2=${ADMIN_EMAIL}`
      );
      if (response.ok) {
        const history = await response.json();
        console.log('=== Loaded', history.length, 'messages');
        return history;
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    return [];
  };

  // Check unread messages for all conversations
  const checkUnreadMessages = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/chat/conversations?userEmail=${ADMIN_EMAIL}`);
      if (res.ok) {
        const convs = await res.json();
        
        setActiveSessions((prev) => {
          const newSessions = new Map(prev);
          
          convs.forEach((conv) => {
            const userEmail = conv.partnerEmail;
            const lastSeenKey = `chat_lastSeen_${ADMIN_EMAIL}_${userEmail}`;
            const lastSeenTimestamp = localStorage.getItem(lastSeenKey);
            
            // Get or create session
            const session = newSessions.get(userEmail) || { 
              userEmail, 
              userName: userEmail, 
              messages: [], 
              unreadCount: 0 
            };
            
            // If we have a lastMessage and lastSeen timestamp
            if (conv.lastMessage && conv.lastMessageTime && lastSeenTimestamp) {
              const lastMessageTime = new Date(conv.lastMessageTime);
              const lastSeen = new Date(lastSeenTimestamp);
              
              // If last message is from user (not admin) and is newer than lastSeen
              if (conv.lastMessageSender !== ADMIN_EMAIL && lastMessageTime > lastSeen) {
                // Load messages to count unread
                fetch(`http://localhost:8080/api/chat/last-50?user1=${userEmail}&user2=${ADMIN_EMAIL}`)
                  .then(r => r.json())
                  .then(messages => {
                    const unreadMessages = messages.filter(msg => 
                      msg.sender === userEmail && 
                      new Date(msg.timestamp) > lastSeen
                    );
                    
                    if (unreadMessages.length > 0) {
                      setActiveSessions((prev2) => {
                        const newSessions2 = new Map(prev2);
                        const session2 = newSessions2.get(userEmail) || { 
                          userEmail, 
                          userName: userEmail, 
                          messages: [], 
                          unreadCount: 0 
                        };
                        session2.unreadCount = unreadMessages.length;
                        newSessions2.set(userEmail, session2);
                        return newSessions2;
                      });
                      console.log('=== Found', unreadMessages.length, 'unread messages from', userEmail);
                    }
                  });
              }
            }
            
            newSessions.set(userEmail, session);
          });
          
          return newSessions;
        });
      }
    } catch (error) {
      console.error('Error checking unread messages:', error);
    }
  };

  const sendMessage = () => {
    if (!selectedUser || !inputMessage.trim()) return;

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
    markAsRead(selectedUser);
    
    // Update lastSeen timestamp when sending message
    const lastSeenKey = `chat_lastSeen_${ADMIN_EMAIL}_${selectedUser}`;
    localStorage.setItem(lastSeenKey, new Date().toISOString());
    
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

  const handleSelectUser = async (userEmail) => {
    setSelectedUser(userEmail);
    selectedUserRef.current = userEmail;
    markAsRead(userEmail);

    // Save lastSeen timestamp to localStorage
    const lastSeenKey = `chat_lastSeen_${ADMIN_EMAIL}_${userEmail}`;
    localStorage.setItem(lastSeenKey, new Date().toISOString());

    const history = await loadChatHistory(userEmail);
    setActiveSessions((prev) => {
      const next = new Map(prev);
      const existing = next.get(userEmail) || { userEmail, userName: userEmail, messages: [], unreadCount: 0 };
      existing.messages = history;
      next.set(userEmail, existing);
      return next;
    });
    setTimeout(scrollToBottom, 150);
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

  const selectedSession = selectedUser
    ? activeSessions.get(selectedUser) || { userEmail: selectedUser, userName: selectedUser, messages: [], unreadCount: 0 }
    : null;

  const totalUnread = Array.from(activeSessions.values()).reduce((sum, s) => sum + (s.unreadCount || 0), 0);

  return (
    <>
      {/* Chat toggle button */}
      <button
        className={`admin-chat-toggle ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        title="Hỗ trợ khách hàng"
      >
        <FaComments size={24} />
        {totalUnread > 0 && (
          <span className="notification-dot" />
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
            {/* Conversation list */}
            <div className="user-list">
              <div className="user-list-header">
                <h5>Lịch sử trò chuyện ({conversations.length})</h5>
              </div>
              <div className="user-list-items">
                {conversations.length === 0 ? (
                  <div className="empty-user-list">
                    <p>Chưa có cuộc trò chuyện nào</p>
                  </div>
                ) : (
                  conversations.map((item) => {
                    const session = activeSessions.get(item.partnerEmail) || { userEmail: item.partnerEmail, userName: item.partnerEmail, unreadCount: 0 };
                    // Nếu tin nhắn cuối là của admin thì thêm "me: " vào đầu
                    const displayMessage = item.lastMessage 
                      ? (item.lastMessageSender === ADMIN_EMAIL ? 'me: ' : '') + item.lastMessage
                      : '';
                    return (
                      <div
                        key={item.partnerEmail}
                        className={`user-item ${selectedUser === item.partnerEmail ? 'active' : ''}`}
                        onClick={() => handleSelectUser(item.partnerEmail)}
                      >
                        <div className="user-avatar">
                          <FaUser />
                        </div>
                        <div className="user-info">
                          <div className="user-name">{item.partnerEmail}</div>
                          {displayMessage && (
                            <div className="last-message" title={displayMessage}>{displayMessage}</div>
                          )}
                        </div>
                        {session.unreadCount > 0 && (
                          <span className="unread-badge">{session.unreadCount}</span>
                        )}
                      </div>
                    );
                  })
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
                      groupMessagesByDate(selectedSession.messages).map((item, index) => {
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
                              className={`message ${msg.sender === ADMIN_EMAIL ? 'sent' : 'received'}`}
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
