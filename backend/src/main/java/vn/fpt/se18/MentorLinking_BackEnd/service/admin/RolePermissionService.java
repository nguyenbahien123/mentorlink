package vn.fpt.se18.MentorLinking_BackEnd.service.admin;

import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.CreatePermissionRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.CreateRoleRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.UpdateRolePermissionsRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PermissionResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.RoleResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.RoleStatisticsResponse;

import java.util.List;

public interface RolePermissionService {

    // Role Management
    BaseResponse<RoleResponse> createRole(CreateRoleRequest request);
    BaseResponse<RoleResponse> updateRole(Long id, CreateRoleRequest request);
    BaseResponse<Void> deleteRole(Long id);
    BaseResponse<RoleResponse> getRoleById(Long id);
    BaseResponse<PageResponse<RoleResponse>> getAllRoles(int page, int size, String search);

    // Permission Management
    BaseResponse<PermissionResponse> createPermission(CreatePermissionRequest request);
    BaseResponse<PermissionResponse> updatePermission(Integer id, CreatePermissionRequest request);
    BaseResponse<Void> deletePermission(Integer id);
    BaseResponse<List<PermissionResponse>> getAllPermissions();

    // Role-Permission Management
    BaseResponse<Void> updateRolePermissions(UpdateRolePermissionsRequest request);
    BaseResponse<List<PermissionResponse>> getRolePermissions(Long roleId);

    // Statistics
    BaseResponse<RoleStatisticsResponse> getRoleStatistics();
}
