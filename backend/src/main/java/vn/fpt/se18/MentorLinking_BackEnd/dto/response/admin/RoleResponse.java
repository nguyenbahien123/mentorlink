package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleResponse {

    private Long id;
    private String code;
    private String name;
    private String description;
    private Boolean status;
    private LocalDateTime createdAt;
    private Integer userCount;
    private List<PermissionResponse> permissions;
}
