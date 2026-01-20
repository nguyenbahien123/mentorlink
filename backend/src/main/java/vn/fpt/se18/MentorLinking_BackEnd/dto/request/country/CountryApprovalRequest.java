package vn.fpt.se18.MentorLinking_BackEnd.dto.request.country;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CountryApprovalRequest {
    
    @Size(max = 500, message = "Flag URL must not exceed 500 characters")
    private String flagUrl;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    private Boolean isApproved;
}
