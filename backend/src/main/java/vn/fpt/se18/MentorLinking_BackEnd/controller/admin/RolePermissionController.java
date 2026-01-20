package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.CreatePermissionRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.CreateRoleRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.UpdateRolePermissionsRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PermissionResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.RoleResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.RoleStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.RolePermissionService;

import java.util.List;

@RestController
@RequestMapping("/admin/roles-permissions")
@RequiredArgsConstructor
public class RolePermissionController {

    private final RolePermissionService rolePermissionService;

    @GetMapping("/statistics")
    public ResponseEntity<BaseResponse<RoleStatisticsResponse>> getRoleStatistics() {
        BaseResponse<RoleStatisticsResponse> response = rolePermissionService.getRoleStatistics();
        return ResponseEntity.ok(response);
    }


    @PostMapping("/roles")
    public ResponseEntity<BaseResponse<RoleResponse>> createRole(@Valid @RequestBody CreateRoleRequest request) {
        BaseResponse<RoleResponse> response = rolePermissionService.createRole(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<BaseResponse<RoleResponse>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody CreateRoleRequest request) {
        BaseResponse<RoleResponse> response = rolePermissionService.updateRole(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<BaseResponse<Void>> deleteRole(@PathVariable Long id) {
        BaseResponse<Void> response = rolePermissionService.deleteRole(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<BaseResponse<RoleResponse>> getRoleById(@PathVariable Long id) {
        BaseResponse<RoleResponse> response = rolePermissionService.getRoleById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/roles")
    public ResponseEntity<BaseResponse<PageResponse<RoleResponse>>> getAllRoles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        BaseResponse<PageResponse<RoleResponse>> response = rolePermissionService.getAllRoles(page, size, search);
        return ResponseEntity.ok(response);
    }

    // ==================== PERMISSION APIs ====================

    @PostMapping("/permissions")
    public ResponseEntity<BaseResponse<PermissionResponse>> createPermission(@Valid @RequestBody CreatePermissionRequest request) {
        BaseResponse<PermissionResponse> response = rolePermissionService.createPermission(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/permissions/{id}")
    public ResponseEntity<BaseResponse<PermissionResponse>> updatePermission(
            @PathVariable Integer id,
            @Valid @RequestBody CreatePermissionRequest request) {
        BaseResponse<PermissionResponse> response = rolePermissionService.updatePermission(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/permissions/{id}")
    public ResponseEntity<BaseResponse<Void>> deletePermission(@PathVariable Integer id) {
        BaseResponse<Void> response = rolePermissionService.deletePermission(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/permissions")
    public ResponseEntity<BaseResponse<List<PermissionResponse>>> getAllPermissions() {
        BaseResponse<List<PermissionResponse>> response = rolePermissionService.getAllPermissions();
        return ResponseEntity.ok(response);
    }

    // ==================== ROLE-PERMISSION APIs ====================

    @PutMapping("/roles/{roleId}/permissions")
    public ResponseEntity<BaseResponse<Void>> updateRolePermissions(
            @PathVariable Long roleId,
            @RequestBody List<Integer> permissionIds) {
        UpdateRolePermissionsRequest request = new UpdateRolePermissionsRequest();
        request.setRoleId(roleId);
        request.setPermissionIds(permissionIds);

        BaseResponse<Void> response = rolePermissionService.updateRolePermissions(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/roles/{roleId}/permissions")
    public ResponseEntity<BaseResponse<List<PermissionResponse>>> getRolePermissions(@PathVariable Long roleId) {
        BaseResponse<List<PermissionResponse>> response = rolePermissionService.getRolePermissions(roleId);
        return ResponseEntity.ok(response);
    }
}
