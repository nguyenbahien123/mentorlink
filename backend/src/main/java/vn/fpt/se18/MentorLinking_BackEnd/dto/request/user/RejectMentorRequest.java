package vn.fpt.se18.MentorLinking_BackEnd.dto.request.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectMentorRequest {
    @NotNull(message = "User ID không được để trống")
    private Long userId;

    @NotBlank(message = "Lý do từ chối không được để trống")
    private String reason;
}
