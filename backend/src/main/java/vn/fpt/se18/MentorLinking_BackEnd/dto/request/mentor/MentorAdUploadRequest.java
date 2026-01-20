package vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MentorAdUploadRequest {
    @NotEmpty
    private String title;
    @NotEmpty
    private String linkUrl;
}