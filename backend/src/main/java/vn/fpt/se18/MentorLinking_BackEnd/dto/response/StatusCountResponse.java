package vn.fpt.se18.MentorLinking_BackEnd.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class StatusCountResponse {
    private String statusName;
    private String statusCode;
    private Integer count;
}