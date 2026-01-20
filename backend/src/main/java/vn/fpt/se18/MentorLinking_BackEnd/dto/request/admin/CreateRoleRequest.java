package vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateRoleRequest {

    @NotBlank(message = "Mã vai trò không được để trống")
    @Size(max = 50, message = "Mã vai trò không được vượt quá 50 ký tự")
    private String code;

    @NotBlank(message = "Tên vai trò không được để trống")
    @Size(max = 100, message = "Tên vai trò không được vượt quá 100 ký tự")
    private String name;

    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;

    private List<Integer> permissionIds;
}
