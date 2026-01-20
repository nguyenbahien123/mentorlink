package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.user.GetUserRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.user.UserRequestDTO;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.AdminUserDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.user.UserDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.user.UserStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Role;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.RoleRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserStatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.EmailService;
import vn.fpt.se18.MentorLinking_BackEnd.service.UserService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserStatusRepository userStatusRepository;
    private final RoleRepository roleRepository;
    private final EmailService emailService;

    @Autowired
    public UserServiceImpl(
            UserRepository userRepository,
            UserStatusRepository userStatusRepository,
            RoleRepository roleRepository,
            @Lazy EmailService emailService) {
        this.userRepository = userRepository;
        this.userStatusRepository = userStatusRepository;
        this.roleRepository = roleRepository;
        this.emailService = emailService;
    }

    @Override
    public UserDetailsService userDetailsService() {
//        return username -> userRepository.findByUsernameWithRole(username)
//                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return username -> userRepository.findByEmailWithRole(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    }

    @Override
    public User getByUsername(String userName) {
        return userRepository.findByUsername(userName).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    public long saveUser(UserRequestDTO request) {
        User user = User.builder()
                .fullname(request.getFirstName())
                .email(request.getEmail())
                .password(request.getPassword())
                .build();
        userRepository.save(user);

        log.info("User has added successfully, userId={}", user.getId());

        return user.getId();
    }

    @Override
    public void saveUser(User user) {
        userRepository.save(user);
    }

    @Override
    public List<String> getAllRolesByUserId(long userId) {
        return userRepository.findAllRolesByUserId(userId);
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "Email not found"));
    }

    @Override
    public BaseResponse<PageResponse<UserDetailResponse>> getAllUsersWithCondition(BaseRequest<GetUserRequest> request) {
        GetUserRequest requestData = request.getData();
        Pageable pageable = PageRequest.of(requestData.getPage() - 1, requestData.getSize());


        String keySearch = requestData.getKeySearch() != null ? requestData.getKeySearch().trim() : null;
        Long status = requestData.getStatus() != null ? requestData.getStatus().longValue() : null;
        Long roleId = requestData.getRoleId() != null ? requestData.getRoleId().longValue() : null;

        Page<User> pageResult = userRepository.findAllWithCondition(
                keySearch,
                roleId,
                status,
                pageable
        );

        PageResponse<UserDetailResponse> pageResponse = PageResponse.<UserDetailResponse>builder()
                .content(pageResult.getContent().stream()
                        .map(this::convertToResponse)
                        .collect(Collectors.toList()))
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .currentPage(request.getData().getPage())
                .pageSize(request.getData().getSize())
                .build();

        return BaseResponse.<PageResponse<UserDetailResponse>>builder()
                .requestDateTime(request.getRequestDateTime())
                .respCode("0")
                .description("Get all users successfully")
                .data(pageResponse)
                .build();
    }

    @Override
    public BaseResponse<UserDetailResponse> getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED, "User not found"));

        return BaseResponse.<UserDetailResponse>builder()
                .requestDateTime("")
                .respCode("0")
                .description("Get user successfully")
                .data(convertToResponse(user))
                .build();
    }

    @Override
    public BaseResponse<AdminUserDetailResponse> getAdminUserDetailById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED, "User not found"));

        return BaseResponse.<AdminUserDetailResponse>builder()
                .requestDateTime("")
                .respCode("0")
                .description("Get user detail successfully")
                .data(convertToAdminUserDetailResponse(user))
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<Void> deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED, "User not found"));

        userRepository.delete(user);
        log.info("User deleted successfully, userId={}", id);

        return BaseResponse.<Void>builder()
                .requestDateTime(String.valueOf(LocalDateTime.now()))
                .respCode("0")
                .description("User deleted successfully")
                .build();
    }

    @Override
    public BaseResponse<UserStatisticsResponse> getUserStatistics() {
        long totalUsers = userRepository.count();

        Map<String, Long> usersByStatus = new HashMap<>();
        List<Status> allStatuses = userStatusRepository.findAll();
        for (Status status : allStatuses) {
            long count = userRepository.countByStatus(status);
            usersByStatus.put(status.getName(), count);
        }

        Map<String, Long> usersByRole = new HashMap<>();
        List<Role> allRoles = roleRepository.findAll();
        for (Role role : allRoles) {
            long count = userRepository.countByRole(role);
            usersByRole.put(role.getName(), count);
        }

        UserStatisticsResponse statistics = UserStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .totalUserBlocked(usersByStatus.getOrDefault("BLOCKED", 0L))
                .totalMentorPending(usersByStatus.getOrDefault("PENDING", 0L))
                .totalMentors(usersByRole.getOrDefault("MENTOR", 0L))
                .build();

        return BaseResponse.<UserStatisticsResponse>builder()
                .requestDateTime("")
                .respCode("0")
                .description("Get user statistics successfully")
                .data(statistics)
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<Void> toggleBlockUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED, "User not found"));

        String currentStatus = user.getStatus().getName();
        
        // Toggle between ACTIVE and INACTIVE
        // PENDING users cannot be toggled, they must be approved or rejected first
        if ("PENDING".equals(currentStatus)) {
            throw new AppException(ErrorCode.UNCATEGORIZED, "Cannot toggle status for PENDING users. Please approve or reject first.");
        }

        Status newStatus;
        String description;
        
        if ("ACTIVE".equals(currentStatus)) {
            // Change ACTIVE to INACTIVE
            newStatus = userStatusRepository.findByName("INACTIVE")
                    .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED, "INACTIVE status not found"));
            description = "User deactivated successfully";
            log.info("User deactivated, userId={}", id);
        } else {
            // Change INACTIVE to ACTIVE (or any other status to ACTIVE)
            newStatus = userStatusRepository.findByName("ACTIVE")
                    .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED, "ACTIVE status not found"));
            description = "User activated successfully";
            log.info("User activated, userId={}", id);
        }

        user.setStatus(newStatus);
        userRepository.save(user);

        return BaseResponse.<Void>builder()
                .requestDateTime(String.valueOf(LocalDateTime.now()))
                .respCode("0")
                .description(description)
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<Void> rejectMentor(Long userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED, "User not found"));

        // Kiểm tra xem user có phải là Mentor đang chờ duyệt không
        if (!"PENDING".equals(user.getStatus().getName())) {
            throw new AppException(ErrorCode.UNCATEGORIZED, "User is not in PENDING status");
        }

        if (!"MENTOR".equals(user.getRole().getName())) {
            throw new AppException(ErrorCode.UNCATEGORIZED, "User is not a MENTOR");
        }

        // Gửi email thông báo từ chối
        try {
            emailService.sendMentorRejection(
                user.getEmail(),
                user.getFullname() != null ? user.getFullname() : "Mentor",
                reason
            );
            log.info("Rejection email sent to mentor userId={}, email={}", userId, user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send rejection email to userId={}", userId, e);
            // Không throw exception, vẫn tiếp tục xóa user
        }

        // Xóa user khỏi hệ thống
        userRepository.delete(user);
        log.info("Mentor rejected and deleted, userId={}", userId);

        return BaseResponse.<Void>builder()
                .requestDateTime(String.valueOf(LocalDateTime.now()))
                .respCode("0")
                .description("Mentor rejected and deleted successfully")
                .build();
    }


    private UserDetailResponse convertToResponse(User user) {
        return UserDetailResponse.builder()
                .id(user.getId())
                .fullName(user.getFullname())
                .email(user.getEmail())
                .roleName(user.getRole().getName().isEmpty() ? null : user.getRole().getName())
                .status(user.getStatus().getName())
                .createTime(user.getCreatedAt())
                .build();
    }

    private AdminUserDetailResponse convertToAdminUserDetailResponse(User user) {
        return AdminUserDetailResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullname())
                .roleName(user.getRole() != null ? user.getRole().getName() : null)
                .status(user.getStatus() != null ? user.getStatus().getName() : null)
                .createTime(user.getCreatedAt())
                // Thông tin bổ sung
                .dob(user.getDob())
                .phone(user.getPhone())
                .gender(user.getGender())
                .address(user.getAddress())
                .currentLocation(user.getCurrentLocation())
                .title(user.getTitle())
                .highestDegree(user.getHighestDegree() != null ? user.getHighestDegree().getName() : null)
                .linkedinUrl(user.getLinkedinUrl())
                .avatarUrl(user.getAvatarUrl())
                .intro(user.getIntro())
                .rating(user.getRating())
                .numberOfBooking(user.getNumberOfBooking())
                .bankName(user.getBankName())
                .bankAccountNumber(user.getBankAccountNumber())
                .lastLogin(user.getLastLogin())
                .isBlocked(user.getIsBlocked())
                .build();
    }
}
