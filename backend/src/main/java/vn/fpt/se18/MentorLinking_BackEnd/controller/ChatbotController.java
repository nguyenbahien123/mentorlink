package vn.fpt.se18.MentorLinking_BackEnd.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.ChatMessageDTO;
import vn.fpt.se18.MentorLinking_BackEnd.dto.ChatResponseDTO;
import vn.fpt.se18.MentorLinking_BackEnd.service.ChatbotService;
import vn.fpt.se18.MentorLinking_BackEnd.service.DataSyncService;

/**
 * REST Controller for chatbot endpoints
 * Handles chat messages and provides AI-powered responses
 */
@RestController
@RequestMapping("/chatbot")
@Slf4j
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @Autowired
    private DataSyncService dataSyncService;

    /**
     * Process user message and return AI response
     * POST /api/chatbot/chat
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponseDTO> chat(@RequestBody ChatMessageDTO messageDTO) {
        try {
            log.info("Received chat message: {}", messageDTO.getMessage());
            
            // Validate input
            if (messageDTO == null || messageDTO.getMessage() == null || messageDTO.getMessage().trim().isEmpty()) {
                log.warn("Invalid message: message is null or empty");
                ChatResponseDTO errorResponse = ChatResponseDTO.builder()
                        .message("Vui lòng nhập tin nhắn")
                        .recommendedMentors(new java.util.ArrayList<>())
                        .confidence(0.0)
                        .build();
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Process message and generate response
            ChatResponseDTO response = chatbotService.processMessage(messageDTO);

            log.info("Chat response generated successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error processing chat message", e);
            e.printStackTrace();
            ChatResponseDTO errorResponse = ChatResponseDTO.builder()
                    .message("Xin lỗi, tôi gặp lỗi: " + e.getMessage())
                    .recommendedMentors(new java.util.ArrayList<>())
                    .confidence(0.0)
                    .build();
            return ResponseEntity.ok(errorResponse); // Return 200 with error message
        }
    }

    /**
     * Sync data to Qdrant (admin endpoint)
     * POST /api/chatbot/sync-data
     */
    @PostMapping("/sync-data")
    public ResponseEntity<String> syncData() {
        try {
            log.info("Starting data sync to Qdrant...");
            dataSyncService.syncAllDataToQdrant();
            log.info("Data sync completed successfully");
            return ResponseEntity.ok("Data synced to Qdrant successfully");

        } catch (Exception e) {
            log.error("Error syncing data", e);
            return ResponseEntity.internalServerError()
                    .body("Failed to sync data: " + e.getMessage());
        }
    }

    /**
     * Health check endpoint
     * GET /api/chatbot/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Chatbot service is running");
    }
}
