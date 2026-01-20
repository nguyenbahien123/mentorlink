package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorEducationAdminResponse {
    private Long id;
    private String schoolName;
    private String major;
    private LocalDate startDate;
    private LocalDate endDate;
    private String certificateImage;
    private String statusCode;
    private String statusName;
}
