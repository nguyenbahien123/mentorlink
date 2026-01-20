package vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor;

import jakarta.persistence.Column;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorTestResponse {
    private Long id;

    private Long mentorId;

    private String testName;

    private String score;

    private String scoreImage;

    private String status;

    private String statusCode;

    private String createdAt;

    private String updatedAt;
}
