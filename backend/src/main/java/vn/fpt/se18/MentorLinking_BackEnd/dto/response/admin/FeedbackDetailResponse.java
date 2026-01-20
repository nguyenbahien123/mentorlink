package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDetailResponse {
    private Long id;
    private Long reporterId;
    private String reporterName;
    private String reporterEmail;
    private String type;              // FEEDBACK, REPORT, COMPLAINT
    private Long targetId;            // ID của đối tượng bị báo cáo (nếu có)
    private String targetTable;       // Bảng của đối tượng (users, bookings, etc.)
    private String targetInfo;        // Thông tin mô tả đối tượng
    private String content;           // Nội dung feedback/report
    private String status;            // PENDING, IN_PROGRESS, RESOLVED, REJECTED
    private String priority;          // LOW, MEDIUM, HIGH
    private String response;          // Phản hồi từ admin
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}
