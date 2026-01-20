package vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorServiceRequest {

    @NotBlank(message = "Service name cannot be blank")
    @Size(min = 3, max = 255, message = "Service name must be between 3 and 255 characters")
    private String serviceName;

    @NotBlank(message = "Description cannot be blank")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;
}
