package vn.fpt.se18.MentorLinking_BackEnd.dto.request;

import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BaseRequest<BODY> {
    private String requestDateTime;
    @Valid
    private BODY data;
}
