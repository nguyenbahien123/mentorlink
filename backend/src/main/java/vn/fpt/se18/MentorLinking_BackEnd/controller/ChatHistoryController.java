package vn.fpt.se18.MentorLinking_BackEnd.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.ChatMessage;
import vn.fpt.se18.MentorLinking_BackEnd.entity.ChatMessageEntity;
import vn.fpt.se18.MentorLinking_BackEnd.service.ChatMessageService;

import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class ChatHistoryController {
    
    private final ChatMessageService chatMessageService;
    
    /**
     * Lấy lịch sử chat giữa 2 người
     * GET /api/chat/history?user1=email1&user2=email2
     */
    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @RequestParam String user1,
            @RequestParam String user2) {
        
        System.out.println("=== Loading chat history between: " + user1 + " and " + user2);
        
        List<ChatMessageEntity> entities = chatMessageService.getChatHistory(user1, user2);
        
        System.out.println("=== Found " + entities.size() + " messages in DB");
        
        // Convert entity to DTO
        List<ChatMessage> messages = entities.stream()
                .map(entity -> {
                    ChatMessage dto = new ChatMessage();
                    dto.setSender(entity.getSender());
                    dto.setSenderName(entity.getSenderName());
                    dto.setRecipient(entity.getRecipient());
                    dto.setContent(entity.getContent());
                    dto.setType(entity.getType());
                    dto.setTimestamp(entity.getTimestamp());
                    dto.setSessionId(entity.getSessionId());
                    return dto;
                })
                .collect(Collectors.toList());
        
        System.out.println("=== Returning " + messages.size() + " messages to client");
        
        return ResponseEntity.ok(messages);
    }
}
