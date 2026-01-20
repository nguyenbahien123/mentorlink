package vn.fpt.se18.MentorLinking_BackEnd.dto.response.auth;

import lombok.Builder;
import lombok.Getter;

import java.io.Serializable;

@Getter
@Builder
public class TokenResponse implements Serializable {

    private String accessToken;

    private String refreshToken;

    private Long userId;

}
