package vn.fpt.se18.MentorLinking_BackEnd.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BaseResponse<BODY> {
    private String requestDateTime;
    @Builder.Default
    private String respCode = "0";
    private String description;
    private BODY data;
}

