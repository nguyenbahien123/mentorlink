package vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

import java.io.Serializable;

@Getter
public class SignInRequest implements Serializable {

    @NotBlank(message = "email must be not null")
    private String email;

    @NotBlank(message = "password must be not blank")
    private String password;

}
