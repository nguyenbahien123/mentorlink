package vn.fpt.se18.MentorLinking_BackEnd.dto.request.country;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CountrySuggestionRequest {
    
    @NotBlank(message = "Country name is required")
    @Size(max = 255, message = "Country name must not exceed 255 characters")
    private String name;
    
    @NotBlank(message = "Country code is required")
    @Size(max = 10, message = "Country code must not exceed 10 characters")
    private String code;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @NotNull(message = "Suggested by (mentor ID) is required")
    private Long suggestedBy;
}
