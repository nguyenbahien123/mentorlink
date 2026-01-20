package vn.fpt.se18.MentorLinking_BackEnd.dto.request;

import lombok.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.validator.EnumValue;
import vn.fpt.se18.MentorLinking_BackEnd.util.Urgency;

import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaqRequest {
    @NotBlank(message = "Question is required")
    private String question;

    private String answer;

    @EnumValue(name = "urgency", enumClass = Urgency.class, message = "Urgency must be one of enum Urgency")
    private String urgency;

    private Boolean isPublished;
}
