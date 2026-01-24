package vn.fpt.se18.MentorLinking_BackEnd.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "message")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "from_user", nullable = false)
    private String sender;
    
    @Column(nullable = false)
    private String senderName;
    
    @Column(nullable = false)
    private String recipient;
    
    @Column(name = "message_text", columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Column(nullable = false)
    private String type;  // MESSAGE, JOIN, LEAVE
    
    @Column(name = "send_date_time", nullable = false)
    private LocalDateTime timestamp;
    
    private String sessionId;
}
