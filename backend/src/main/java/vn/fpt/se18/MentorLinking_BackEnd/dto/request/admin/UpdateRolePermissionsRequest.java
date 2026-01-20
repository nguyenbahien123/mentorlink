package vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class UpdateRolePermissionsRequest {

    @NotNull(message = "ID vai trò không được để trống")
    private Long roleId;

    private List<Integer> permissionIds;
}
