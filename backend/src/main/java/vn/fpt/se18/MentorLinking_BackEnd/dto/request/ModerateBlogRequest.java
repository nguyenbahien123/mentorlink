package vn.fpt.se18.MentorLinking_BackEnd.dto.request;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
public class ModerateBlogRequest {

    @NotNull(message = "Decision status ID is required")
    private Long decisionId;

    private String comment;
}
