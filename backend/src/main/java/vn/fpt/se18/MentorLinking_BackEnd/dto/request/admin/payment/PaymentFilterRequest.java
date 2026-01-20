package vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.payment;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentFilterRequest {
    private String keySearch; // Tìm theo transaction code, tên customer, mentor
    private String status; // PENDING, COMPLETED, FAILED, REFUNDED
    private String paymentMethod; // VNPAY, MOMO, BANK_TRANSFER, CREDIT_CARD
    private String dateFrom; // Filter theo range
    private String dateTo;
    
    @Builder.Default
    private Integer page = 1;
    
    @Builder.Default
    private Integer size = 10;
}
