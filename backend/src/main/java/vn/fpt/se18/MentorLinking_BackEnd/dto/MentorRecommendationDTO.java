package vn.fpt.se18.MentorLinking_BackEnd.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for recommended mentors from chatbot
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorRecommendationDTO {
    private Long mentorId;
    private String name;
    private String expertise;
    private Double rating;
    private String profileImage;
    private String reason; // Why this mentor was recommended
    private Double relevanceScore;
}
