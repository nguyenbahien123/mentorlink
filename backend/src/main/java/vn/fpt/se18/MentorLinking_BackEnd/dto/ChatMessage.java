package vn.fpt.se18.MentorLinking_BackEnd.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String sender; // Email of sender
    private String senderName; // Display name of sender
    private String recipient; // Email of recipient
    private String content;
    private String type; // JOIN, LEAVE, MESSAGE
    private LocalDateTime timestamp;
    private String sessionId; // Session identifier for the chat
}
