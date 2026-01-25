package vn.fpt.se18.MentorLinking_BackEnd.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.entity.ChatMessageEntity;
import vn.fpt.se18.MentorLinking_BackEnd.repository.ChatMessageRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageService {
    
    private final ChatMessageRepository chatMessageRepository;
    
    /**
     * Lưu tin nhắn vào database
     */
    public ChatMessageEntity saveMessage(String sender, String senderName, 
                                        String recipient, String content, 
                                        String type, String sessionId) {
        ChatMessageEntity message = ChatMessageEntity.builder()
                .sender(sender)
                .senderName(senderName)
                .recipient(recipient)
                .content(content)
                .type(type)
                .timestamp(LocalDateTime.now())
                .sessionId(sessionId)
                .build();
        
        ChatMessageEntity saved = chatMessageRepository.save(message);
        log.info("Saved message: {} from {} to {}", saved.getId(), sender, recipient);
        return saved;
    }
    
    /**
     * Lấy lịch sử chat giữa 2 người
     */
    public List<ChatMessageEntity> getChatHistory(String user1, String user2) {
        log.info("Loading chat history between {} and {}", user1, user2);
        return chatMessageRepository.findChatHistory(user1, user2);
    }
    
    /**
     * Lấy 50 tin nhắn gần nhất giữa 2 người
     */
    public List<ChatMessageEntity> getLast50Messages(String user1, String user2) {
        log.info("Loading last 50 messages between {} and {}", user1, user2);
        List<ChatMessageEntity> messages = chatMessageRepository.findLast50Messages(user1, user2);
        
        // Reverse để hiển thị từ cũ nhất đến mới nhất
        java.util.Collections.reverse(messages);
        
        return messages;
    }
    
    /**
     * Lấy tất cả chat của một user
     */
    public List<ChatMessageEntity> getAllChatsByUser(String userEmail) {
        return chatMessageRepository.findAllByUser(userEmail);
    }

    /**
     * Lấy danh sách cuộc trò chuyện (partner + last message)
     */
    public List<ConversationSummary> getConversationSummaries(String userEmail) {
        List<Object[]> raw = chatMessageRepository.findConversationPartners(userEmail);
        return raw.stream().map(row -> {
            String partner = (String) row[0];
            ChatMessageEntity last = chatMessageRepository.findLastMessageBetween(userEmail, partner);
            return new ConversationSummary(partner, last);
        }).toList();
    }

    public record ConversationSummary(String partnerEmail, ChatMessageEntity lastMessage) {}
}
