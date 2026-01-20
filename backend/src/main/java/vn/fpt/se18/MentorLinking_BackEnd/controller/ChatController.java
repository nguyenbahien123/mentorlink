package vn.fpt.se18.MentorLinking_BackEnd.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import vn.fpt.se18.MentorLinking_BackEnd.dto.ChatMessage;
import vn.fpt.se18.MentorLinking_BackEnd.service.ChatSessionService;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatSessionService chatSessionService;

    @MessageMapping("/chat.join")
    public void joinChat(@Payload ChatMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String userEmail = message.getSender();
        String sessionId = headerAccessor.getSessionId();
        
        System.out.println("=== JOIN: User=" + userEmail + " SessionId=" + sessionId);
        
        // Create session for this user
        chatSessionService.createSession(userEmail, sessionId);
        
        // Store user info in WebSocket session
        headerAccessor.getSessionAttributes().put("userEmail", userEmail);
        
        // Only notify admin if user is NOT admin
        if (!userEmail.equals(chatSessionService.getAdminEmail())) {
            // Notify admin about new chat session
            ChatMessage joinMessage = new ChatMessage();
            joinMessage.setSender(userEmail);
            joinMessage.setSenderName(message.getSenderName());
            joinMessage.setRecipient(chatSessionService.getAdminEmail());
            joinMessage.setContent(message.getSenderName() + " đã tham gia chat");
            joinMessage.setType("JOIN");
            joinMessage.setTimestamp(LocalDateTime.now());
            joinMessage.setSessionId(sessionId);
            
            // Broadcast to admin topic
            messagingTemplate.convertAndSend("/topic/chat/" + chatSessionService.getAdminEmail(), joinMessage);
            
            System.out.println("=== JOIN notification broadcasted to admin");
        } else {
            System.out.println("=== Admin joined, no notification sent");
        }
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        
        String sender = message.getSender();
        String recipient = message.getRecipient();
        
        System.out.println("=== MESSAGE: From=" + sender + " To=" + recipient + " Content=" + message.getContent());
        
        // Only send to recipient's topic (sender will add to UI locally)
        messagingTemplate.convertAndSend("/topic/chat/" + recipient, message);
        
        // Also send to sender's topic so they can see it in their chat
        messagingTemplate.convertAndSend("/topic/chat/" + sender, message);
        
        System.out.println("=== Message sent to both sender and recipient topics");
    }

    @MessageMapping("/chat.leave")
    public void leaveChat(@Payload ChatMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String userEmail = message.getSender();
        
        System.out.println("=== LEAVE: User=" + userEmail);
        
        // Remove session
        chatSessionService.removeSession(userEmail);
        
        // Notify admin that user left
        ChatMessage leaveMessage = new ChatMessage();
        leaveMessage.setSender(userEmail);
        leaveMessage.setSenderName(message.getSenderName());
        leaveMessage.setRecipient(chatSessionService.getAdminEmail());
        leaveMessage.setContent(message.getSenderName() + " đã rời chat");
        leaveMessage.setType("LEAVE");
        leaveMessage.setTimestamp(LocalDateTime.now());
        
        // Broadcast to admin topic
        messagingTemplate.convertAndSend("/topic/chat/" + chatSessionService.getAdminEmail(), leaveMessage);
        
        System.out.println("=== LEAVE notification broadcasted");
    }
}