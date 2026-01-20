package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackStatisticsResponse {
    private Long pending;       // Chờ xử lý
    private Long inProgress;    // Đang xử lý
    private Long resolved;      // Đã giải quyết
    private Long highPriority;  // Ưu tiên cao
    private Long total;         // Tổng số feedback
}
