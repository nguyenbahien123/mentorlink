package vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.booking;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingFilterRequest {
    private String keySearch; // Tìm theo tên mentor, customer hoặc service
    private String status; // PENDING, CONFIRMED, COMPLETED, CANCELLED
    private String paymentStatus; // PENDING, PAID, REFUNDED, FAILED
    private String date; // Filter theo ngày cụ thể
    private String dateFrom; // Filter theo range
    private String dateTo;
    private Integer page = 1;
    private Integer size = 10;
}
