package vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CountryResponse {
    private Long id;
    private String code;
    private String name;
    private String flagUrl;
    private String description;
    private String continentName;
    private String continent;
}
