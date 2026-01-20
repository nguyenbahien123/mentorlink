package vn.fpt.se18.MentorLinking_BackEnd.dto.request.user;

import lombok.Getter;
import lombok.Setter;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BasePageRequest;

@Getter
@Setter
public class GetUserRequest extends BasePageRequest {
    private String keySearch;
    private Integer roleId;
    private Integer status;
}