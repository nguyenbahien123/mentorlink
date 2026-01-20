package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewStatisticsResponse {
    
    // Count statistics
    private Long totalReviews;
    private Long publishedReviews;
    private Long pendingReviews;
    private Long reportedReviews;
    
    // Rating statistics
    private Double averageRating;
    private Long fiveStarCount;
    private Long fourStarCount;
    private Long threeStarCount;
    private Long twoStarCount;
    private Long oneStarCount;
}
