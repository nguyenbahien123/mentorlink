package vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.feedback;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackFilterRequest {
    private String keySearch;      // Search by reporter name, email, or content
    private String type;           // FEEDBACK, REPORT, COMPLAINT
    private String status;         // PENDING, IN_PROGRESS, RESOLVED, REJECTED
    private String priority;       // LOW, MEDIUM, HIGH
    private Integer page;
    private Integer size;
}
