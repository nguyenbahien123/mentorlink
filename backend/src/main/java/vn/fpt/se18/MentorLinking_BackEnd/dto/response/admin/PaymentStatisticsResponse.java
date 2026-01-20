package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatisticsResponse {
    
    // Revenue statistics
    private BigDecimal totalRevenue;        // Total completed payments
    private BigDecimal totalCommission;     // Total commission earned
    private BigDecimal totalRefunded;       // Total refunded amount
    private BigDecimal monthlyRevenue;      // Revenue this month
    
    // Count statistics
    private Long totalPayments;             // Total number of payments
    private Long completedCount;            // Number of completed payments
    private Long pendingCount;              // Number of pending payments
    private Long failedCount;               // Number of failed payments
    private Long refundedCount;             // Number of refunded payments
}
