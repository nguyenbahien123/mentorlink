package vn.fpt.se18.MentorLinking_BackEnd.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.ChatMessage;
import vn.fpt.se18.MentorLinking_BackEnd.entity.ChatMessageEntity;
import vn.fpt.se18.MentorLinking_BackEnd.service.ChatMessageService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class ChatHistoryController {
    
    private final ChatMessageService chatMessageService;
    
    /**
     * Lấy lịch sử chat giữa 2 người (tất cả)
     * GET /api/chat/history?user1=email1&user2=email2
     */
    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @RequestParam String user1,
            @RequestParam String user2) {
        
        System.out.println("=== Loading chat history between: " + user1 + " and " + user2);
        
        List<ChatMessageEntity> entities = chatMessageService.getChatHistory(user1, user2);
        
        System.out.println("=== Found " + entities.size() + " messages in DB");
        
        List<ChatMessage> messages = entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        System.out.println("=== Returning " + messages.size() + " messages to client");
        
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Lấy 50 tin nhắn gần nhất giữa 2 người (để load khi mở chat)
     * GET /api/chat/last-50?user1=email1&user2=email2
     */
    @GetMapping("/last-50")
    public ResponseEntity<List<ChatMessage>> getLast50Messages(
            @RequestParam String user1,
            @RequestParam String user2) {
        
        System.out.println("=== Loading last 50 messages between: " + user1 + " and " + user2);
        
        List<ChatMessageEntity> entities = chatMessageService.getLast50Messages(user1, user2);
        
        System.out.println("=== Found " + entities.size() + " recent messages in DB");
        
        List<ChatMessage> messages = entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(messages);
    }

    /**
     * Lấy danh sách cuộc trò chuyện của user (partner + last message)
     * GET /api/chat/conversations?userEmail=email
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<Map<String, Object>>> getConversations(
            @RequestParam String userEmail) {

        List<Map<String, Object>> result = chatMessageService.getConversationSummaries(userEmail)
                .stream()
                .map(summary -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("partnerEmail", summary.partnerEmail());
                    map.put("lastMessage", summary.lastMessage() != null ? summary.lastMessage().getContent() : "");
                    map.put("lastMessageTime", summary.lastMessage() != null ? summary.lastMessage().getTimestamp() : null);
                    map.put("lastMessageSender", summary.lastMessage() != null ? summary.lastMessage().getSender() : null);
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
    
    private ChatMessage convertToDTO(ChatMessageEntity entity) {
        ChatMessage dto = new ChatMessage();
        dto.setSender(entity.getSender());
        dto.setSenderName(entity.getSenderName());
        dto.setRecipient(entity.getRecipient());
        dto.setContent(entity.getContent());
        dto.setType(entity.getType());
        dto.setTimestamp(entity.getTimestamp());
        dto.setSessionId(entity.getSessionId());
        return dto;
    }
}
