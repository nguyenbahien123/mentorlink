package vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import vn.fpt.se18.MentorLinking_BackEnd.enums.PolicyType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title must not exceed 500 characters")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    @NotNull(message = "Active status is required")
    @Builder.Default
    private Boolean isActive = true;

    @NotNull(message = "Type status is required")
    private PolicyType type;
}
