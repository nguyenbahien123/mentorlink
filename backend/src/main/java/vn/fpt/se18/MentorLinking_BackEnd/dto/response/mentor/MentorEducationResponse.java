package vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorEducationResponse {
    private Long id;
    
    private Long mentorId;

    private String schoolName;

    private String major;

    private java.time.LocalDate startDate;

    private java.time.LocalDate endDate;

    private String certificateImage;

    private String status;

    private String statusCode;
    
    private String createdAt;
    
    private String updatedAt;
}
