package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDetailResponse {
    private Long id;
    
    // Mentor info
    private Long mentorId;
    private String mentorName;
    private String mentorEmail;
    
    // Customer info
    private Long customerId;
    private String customerName;
    private String customerEmail;
    
    // Schedule info
    private Long scheduleId;
    private LocalDate date;
    private String timeSlot;
    private String timeSlotText;
    
    // Booking info
    private String service;
    private String description;
    private String comment;
    private String linkMeeting;
    private Boolean isRead;
    
    // Status
    private String status;
    private String paymentProcess;
    
    // Payment info
    private Double amount;
    private String paymentStatus;
    private String paymentMethod;
    private LocalDateTime paidAt;
    
    // Review info
    private Integer rating;
    private String reviewComment;
    private LocalDateTime reviewedAt;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private String cancelReason;
}
