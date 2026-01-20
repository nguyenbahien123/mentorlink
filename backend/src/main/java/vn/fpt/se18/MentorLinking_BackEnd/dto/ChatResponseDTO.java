package vn.fpt.se18.MentorLinking_BackEnd.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO for Chatbot responses with recommended mentors
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDTO {
    private String message;
    private List<MentorRecommendationDTO> recommendedMentors;
    private Double confidence; // Confidence score for the response
}
