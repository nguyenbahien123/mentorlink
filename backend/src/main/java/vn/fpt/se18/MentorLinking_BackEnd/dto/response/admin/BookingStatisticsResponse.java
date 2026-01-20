package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingStatisticsResponse {
    private long pending;
    private long confirmed;
    private long completed;
    private long cancelled;
    private long total;
    
    // Payment statistics
    private long paymentPending;
    private long paymentPaid;
    private long paymentRefunded;
    
    // Revenue
    private Double totalRevenue;
    private Double monthlyRevenue;
}
