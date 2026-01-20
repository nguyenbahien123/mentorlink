package vn.fpt.se18.MentorLinking_BackEnd.dto.request.user;


import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    private String fullName;

    @Email(message = "Email should be valid")
    private String email;

    private String username;

    private String password;

    private Long roleId;

    private Long statusId;
}
