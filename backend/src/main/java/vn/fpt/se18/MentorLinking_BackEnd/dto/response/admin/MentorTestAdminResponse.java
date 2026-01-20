package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorTestAdminResponse {
    private Long id;
    private String testName;
    private String score;
    private String scoreImage;
    private String statusCode;
    private String statusName;
}
