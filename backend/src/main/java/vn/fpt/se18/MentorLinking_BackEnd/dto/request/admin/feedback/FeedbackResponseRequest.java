package vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.feedback;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponseRequest {
    @NotBlank(message = "Response content is required")
    private String response;
    
    private Boolean markAsResolved;  // True to mark as resolved after responding
}
