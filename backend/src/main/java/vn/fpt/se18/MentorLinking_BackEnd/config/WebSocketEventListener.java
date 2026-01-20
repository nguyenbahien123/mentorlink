package vn.fpt.se18.MentorLinking_BackEnd.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import vn.fpt.se18.MentorLinking_BackEnd.dto.ChatMessage;
import vn.fpt.se18.MentorLinking_BackEnd.service.ChatSessionService;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatSessionService chatSessionService;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        // Get user email from session
        String userEmail = chatSessionService.getUserEmail(sessionId);
        
        if (userEmail != null && !userEmail.equals(chatSessionService.getAdminEmail())) {
            log.info("User disconnected: {}", userEmail);
            
            // Notify admin that user left
            ChatMessage leaveMessage = new ChatMessage();
            leaveMessage.setSender(userEmail);
            leaveMessage.setSenderName(userEmail);
            leaveMessage.setRecipient(chatSessionService.getAdminEmail());
            leaveMessage.setContent(userEmail + " đã ngắt kết nối");
            leaveMessage.setType("LEAVE");
            leaveMessage.setTimestamp(LocalDateTime.now());
            leaveMessage.setSessionId(sessionId);
            
            // Send notification to admin
            messagingTemplate.convertAndSendToUser(
                chatSessionService.getAdminEmail(),
                "/queue/notifications",
                leaveMessage
            );
            
            // Remove session
            chatSessionService.removeSessionById(sessionId);
        }
    }
}
