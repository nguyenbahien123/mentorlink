package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl.adminImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.CreatePermissionRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.CreateRoleRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.UpdateRolePermissionsRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PermissionResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.RoleResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.RoleStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Permission;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Role;
import vn.fpt.se18.MentorLinking_BackEnd.entity.RoleHasPermission;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.PermissionRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.RoleHasPermissionRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.RoleRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.RolePermissionService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RolePermissionServiceImpl implements RolePermissionService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RoleHasPermissionRepository roleHasPermissionRepository;

    @Override
    @Transactional
    public BaseResponse<RoleResponse> createRole(CreateRoleRequest request) {
        // Kiểm tra trùng code và name
        if (roleRepository.existsByCode(request.getCode())) {
            throw new AppException(ErrorCode.ROLE_CODE_EXISTED);
        }
        if (roleRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.ROLE_NAME_EXISTED);
        }

        // Tạo role mới
        Role role = Role.builder()
                .code(request.getCode())
                .name(request.getName())
                .build();

        role = roleRepository.save(role);

        // Gán quyền cho role
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            assignPermissionsToRole(role.getId(), request.getPermissionIds());
        }

        RoleResponse response = mapToRoleResponse(role);
        return BaseResponse.<RoleResponse>builder()
                .respCode("0")
                .description("Tạo vai trò thành công")
                .data(response)
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<RoleResponse> updateRole(Long id, CreateRoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        // Kiểm tra trùng code và name (loại trừ chính nó)
        if (!role.getCode().equals(request.getCode()) && roleRepository.existsByCode(request.getCode())) {
            throw new AppException(ErrorCode.ROLE_CODE_EXISTED);
        }
        if (!role.getName().equals(request.getName()) && roleRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.ROLE_NAME_EXISTED);
        }

        // Cập nhật thông tin role
        role.setCode(request.getCode());
        role.setName(request.getName());
        role = roleRepository.save(role);

        // Cập nhật quyền
        if (request.getPermissionIds() != null) {
            roleHasPermissionRepository.deleteByRoleId(id);
            if (!request.getPermissionIds().isEmpty()) {
                assignPermissionsToRole(id, request.getPermissionIds());
            }
        }

        RoleResponse response = mapToRoleResponse(role);
        return BaseResponse.<RoleResponse>builder()
                .respCode("0")
                .description("Cập nhật vai trò thành công")
                .data(response)
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<Void> deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        // Kiểm tra xem có user nào đang sử dụng role này không
        Long userCount = roleRepository.countUsersByRoleCode(role.getCode());
        if (userCount > 0) {
            throw new AppException(ErrorCode.ROLE_IN_USE);
        }

        // Xóa tất cả quyền của role
        roleHasPermissionRepository.deleteByRoleId(id);

        // Xóa role
        roleRepository.delete(role);

        return BaseResponse.<Void>builder()
                .respCode("0")
                .description("Xóa vai trò thành công")
                .build();
    }

    @Override
    public BaseResponse<RoleResponse> getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        RoleResponse response = mapToRoleResponse(role);
        return BaseResponse.<RoleResponse>builder()
                .respCode("0")
                .description("Lấy thông tin vai trò thành công")
                .data(response)
                .build();
    }

    @Override
    public BaseResponse<PageResponse<RoleResponse>> getAllRoles(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Role> rolePage;

        if (search != null && !search.trim().isEmpty()) {
            // Tìm kiếm theo tên hoặc code
            rolePage = roleRepository.findAll(pageable); // Cần thêm search query
        } else {
            rolePage = roleRepository.findAll(pageable);
        }

        List<RoleResponse> roleResponses = rolePage.getContent().stream()
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());

        PageResponse<RoleResponse> pageResponse = PageResponse.<RoleResponse>builder()
                .content(roleResponses)
                .currentPage(page)
                .pageSize(size)
                .totalElements(rolePage.getTotalElements())
                .totalPages(rolePage.getTotalPages())
                .build();

        return BaseResponse.<PageResponse<RoleResponse>>builder()
                .respCode("0")
                .description("Lấy danh sách vai trò thành công")
                .data(pageResponse)
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<PermissionResponse> createPermission(CreatePermissionRequest request) {
        if (permissionRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.PERMISSION_NAME_EXISTED);
        }

        Permission permission = Permission.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        permission = permissionRepository.save(permission);

        PermissionResponse response = mapToPermissionResponse(permission);
        return BaseResponse.<PermissionResponse>builder()
                .respCode("0")
                .description("Tạo quyền thành công")
                .data(response)
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<PermissionResponse> updatePermission(Integer id, CreatePermissionRequest request) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));

        if (!permission.getName().equals(request.getName()) && permissionRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.PERMISSION_NAME_EXISTED);
        }

        permission.setName(request.getName());
        permission.setDescription(request.getDescription());
        permission = permissionRepository.save(permission);

        PermissionResponse response = mapToPermissionResponse(permission);
        return BaseResponse.<PermissionResponse>builder()
                .respCode("0")
                .description("Cập nhật quyền thành công")
                .data(response)
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<Void> deletePermission(Integer id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));

        // Xóa tất cả liên kết role-permission
        roleHasPermissionRepository.deleteAll(permission.getPermissions());

        // Xóa permission
        permissionRepository.delete(permission);

        return BaseResponse.<Void>builder()
                .respCode("0")
                .description("Xóa quyền thành công")
                .build();
    }

    @Override
    public BaseResponse<List<PermissionResponse>> getAllPermissions() {
        List<Permission> permissions = permissionRepository.findAll();
        List<PermissionResponse> responses = permissions.stream()
                .map(this::mapToPermissionResponse)
                .collect(Collectors.toList());

        return BaseResponse.<List<PermissionResponse>>builder()
                .respCode("0")
                .description("Lấy danh sách quyền thành công")
                .data(responses)
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<Void> updateRolePermissions(UpdateRolePermissionsRequest request) {
        roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        // Xóa tất cả quyền hiện tại
        roleHasPermissionRepository.deleteByRoleId(request.getRoleId());

        // Gán quyền mới
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            assignPermissionsToRole(request.getRoleId(), request.getPermissionIds());
        }

        return BaseResponse.<Void>builder()
                .respCode("0")
                .description("Cập nhật quyền cho vai trò thành công")
                .build();
    }

    @Override
    public BaseResponse<List<PermissionResponse>> getRolePermissions(Long roleId) {
        List<RoleHasPermission> rolePermissions = roleHasPermissionRepository.findByRoleIdWithPermissions(roleId);
        List<PermissionResponse> responses = rolePermissions.stream()
                .map(rp -> mapToPermissionResponse(rp.getPermission()))
                .collect(Collectors.toList());

        return BaseResponse.<List<PermissionResponse>>builder()
                .respCode("0")
                .description("Lấy danh sách quyền của vai trò thành công")
                .data(responses)
                .build();
    }

    @Override
    public BaseResponse<RoleStatisticsResponse> getRoleStatistics() {
        Long adminCount = roleRepository.countAdminUsers();
        Long moderatorCount = roleRepository.countModeratorUsers();
        Long mentorCount = roleRepository.countMentorUsers();
        Long customerCount = roleRepository.countCustomerUsers();
        Long totalRoles = roleRepository.count();

        RoleStatisticsResponse response = RoleStatisticsResponse.builder()
                .adminCount(adminCount)
                .moderatorCount(moderatorCount)
                .mentorCount(mentorCount)
                .customerCount(customerCount)
                .totalRoles(totalRoles)
                .build();

        return BaseResponse.<RoleStatisticsResponse>builder()
                .respCode("0")
                .description("Lấy thống kê vai trò thành công")
                .data(response)
                .build();
    }

    private void assignPermissionsToRole(Long roleId, List<Integer> permissionIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        List<Permission> permissions = permissionRepository.findByIds(permissionIds);
        if (permissions.size() != permissionIds.size()) {
            throw new AppException(ErrorCode.PERMISSION_NOT_FOUND);
        }

        List<RoleHasPermission> rolePermissions = permissions.stream()
                .map(permission -> RoleHasPermission.builder()
                        .role(role)
                        .permission(permission)
                        .build())
                .collect(Collectors.toList());

        roleHasPermissionRepository.saveAll(rolePermissions);
    }

    private RoleResponse mapToRoleResponse(Role role) {
        Long userCount = roleRepository.countUsersByRoleCode(role.getCode());
        List<PermissionResponse> permissions = roleHasPermissionRepository.findByRoleIdWithPermissions(role.getId())
                .stream()
                .map(rp -> mapToPermissionResponse(rp.getPermission()))
                .collect(Collectors.toList());

        return RoleResponse.builder()
                .id(role.getId())
                .code(role.getCode())
                .name(role.getName())
                .status(true) // Assuming active by default
                .createdAt(role.getCreatedAt())
                .userCount(userCount.intValue())
                .permissions(permissions)
                .build();
    }

    private PermissionResponse mapToPermissionResponse(Permission permission) {
        return PermissionResponse.builder()
                .id(permission.getId())
                .name(permission.getName())
                .description(permission.getDescription())
                .createdAt(permission.getCreatedAt())
                .build();
    }
}
