package vn.fpt.se18.MentorLinking_BackEnd.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDataResponse {
    private Long bookingId;
    private Long orderCode;
    private BigDecimal amount;
    private String currency;
    private String description;
    
    // Bank account info for manual transfer
    private String bin;
    private String accountNumber;
    private String accountName;
    
    // QR code for scanning with banking app
    private String qrCode;
    
    // Checkout URL (fallback if user wants to go to PayOS page)
    private String checkoutUrl;
    
    // Payment link ID for status checking
    private String paymentLinkId;
    
    private String status;
}
