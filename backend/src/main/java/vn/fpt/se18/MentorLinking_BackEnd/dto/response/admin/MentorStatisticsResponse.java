package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorStatisticsResponse {
    private Long pending;      // Chờ duyệt
    private Long approved;     // Đã duyệt
    private Long rejected;     // Từ chối
    private Long total;        // Tổng đơn
}
