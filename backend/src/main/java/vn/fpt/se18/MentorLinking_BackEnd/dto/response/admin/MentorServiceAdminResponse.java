package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorServiceAdminResponse {
    private Long id;
    private String serviceName;
    private String description;
    private String statusCode;
    private String statusName;
}
