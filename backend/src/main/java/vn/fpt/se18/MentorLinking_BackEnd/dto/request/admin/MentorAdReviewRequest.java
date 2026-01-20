package vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MentorAdReviewRequest {
    @NotEmpty
    private String statusName;

    @NotNull
    private Boolean isPublished;
    private Integer position;
    private String rejectionReason;
}