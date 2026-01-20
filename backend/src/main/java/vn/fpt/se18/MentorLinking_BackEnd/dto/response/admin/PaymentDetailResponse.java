package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDetailResponse {
    private Long id;
    
    // Transaction info
    private String transactionCode;
    private BigDecimal amount;
    private String paymentMethod;
    private String status;
    
    // Booking info
    private Long bookingId;
    private String service;
    
    // Mentor info
    private Long mentorId;
    private String mentorName;
    private String mentorEmail;
    
    // Customer info
    private Long customerId;
    private String customerName;
    private String customerEmail;
    
    // Financial details
    private BigDecimal commission;
    private BigDecimal mentorAmount;
    private BigDecimal refundAmount;
    
    // Gateway info
    private String gatewayResponse;
    private String refundReason;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
    private LocalDateTime refundedAt;
    private LocalDateTime failedAt;
}
