package vn.fpt.se18.MentorLinking_BackEnd.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Set;

@Service
public class ChatSessionService {
    
    // Map of user email -> session ID
    private final Map<String, String> activeSessions = new ConcurrentHashMap<>();
    
    // Map of session ID -> user email (for reverse lookup)
    private final Map<String, String> sessionToUser = new ConcurrentHashMap<>();
    
    private static final String ADMIN_EMAIL = "thuvhhe181435@fpt.edu.vn";
    
    /**
     * Create a new chat session for a user
     */
    public String createSession(String userEmail, String sessionId) {
        activeSessions.put(userEmail, sessionId);
        sessionToUser.put(sessionId, userEmail);
        return sessionId;
    }
    
    /**
     * Get session ID for a user
     */
    public String getSessionId(String userEmail) {
        return activeSessions.get(userEmail);
    }
    
    /**
     * Get user email from session ID
     */
    public String getUserEmail(String sessionId) {
        return sessionToUser.get(sessionId);
    }
    
    /**
     * Remove a session when user leaves
     */
    public void removeSession(String userEmail) {
        String sessionId = activeSessions.remove(userEmail);
        if (sessionId != null) {
            sessionToUser.remove(sessionId);
        }
    }
    
    /**
     * Remove session by session ID
     */
    public void removeSessionById(String sessionId) {
        String userEmail = sessionToUser.remove(sessionId);
        if (userEmail != null) {
            activeSessions.remove(userEmail);
        }
    }
    
    /**
     * Check if user has an active session
     */
    public boolean hasActiveSession(String userEmail) {
        return activeSessions.containsKey(userEmail);
    }
    
    /**
     * Get all active user emails (excluding admin)
     */
    public Set<String> getActiveUsers() {
        return activeSessions.keySet();
    }
    
    /**
     * Get admin email
     */
    public String getAdminEmail() {
        return ADMIN_EMAIL;
    }
}
