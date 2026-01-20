package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorCountryAdminResponse {
    private Long id;
    private Long countryId;
    private String countryName;
    private String flagUrl;
    private String statusCode;
    private String statusName;
}
