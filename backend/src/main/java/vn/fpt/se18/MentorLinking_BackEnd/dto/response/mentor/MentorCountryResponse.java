package vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorCountryResponse {
    private Long id;
    private CountryResponse country;
    private String status;
    private java.time.LocalDateTime createdAt;
}
