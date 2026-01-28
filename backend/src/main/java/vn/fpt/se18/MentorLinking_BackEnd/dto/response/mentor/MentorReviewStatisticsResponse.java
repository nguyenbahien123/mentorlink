package vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorReviewStatisticsResponse {
    private Long totalReviews;
    private Double averageRating;
    private Map<Integer, Long> ratingDistribution; // Key: rating (1-5), Value: count
}
