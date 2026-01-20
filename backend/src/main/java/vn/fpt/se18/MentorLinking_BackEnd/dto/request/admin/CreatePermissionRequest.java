package vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePermissionRequest {

    @NotBlank(message = "Tên quyền không được để trống")
    @Size(max = 100, message = "Tên quyền không được vượt quá 100 ký tự")
    private String name;

    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;
}
