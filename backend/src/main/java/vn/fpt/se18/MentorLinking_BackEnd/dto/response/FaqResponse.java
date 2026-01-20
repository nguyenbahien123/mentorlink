package vn.fpt.se18.MentorLinking_BackEnd.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaqResponse {
    private Long id;
    private String question;
    private String answer;
    private String urgency;
    private boolean isPublished;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
}
