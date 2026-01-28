package vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorReviewResponse {
    private Long id;
    private Long bookingId;
    private Integer rating;
    private String comment;
    private Boolean isPublished;
    private LocalDateTime createdAt;

    // Customer info
    private Long customerId;
    private String customerFullname;

    // Booking service
    private String service;
}
