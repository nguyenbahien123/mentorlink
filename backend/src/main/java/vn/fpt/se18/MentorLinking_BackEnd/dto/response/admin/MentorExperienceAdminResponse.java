package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorExperienceAdminResponse {
    private Long id;
    private String companyName;
    private String position;
    private LocalDate startDate;
    private LocalDate endDate;
    private String experienceImage;
    private String statusCode;
    private String statusName;
}
