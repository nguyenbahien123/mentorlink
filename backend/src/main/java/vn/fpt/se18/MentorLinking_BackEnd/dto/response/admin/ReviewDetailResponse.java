package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDetailResponse {
    private Long id;
    
    // Booking info
    private Long bookingId;
    private String service;
    
    // Customer info
    private Long customerId;
    private String customerName;
    private String customerEmail;
    
    // Mentor info
    private Long mentorId;
    private String mentorName;
    private String mentorEmail;
    
    // Review content
    private Integer rating;
    private String comment;
    
    // Status
    private Boolean isPublished;
    private Boolean isReported;
    private String reportReason;
    private String moderationNote;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
