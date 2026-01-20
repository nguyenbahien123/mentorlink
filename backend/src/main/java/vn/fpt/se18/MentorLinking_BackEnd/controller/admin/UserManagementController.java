package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;


import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.user.GetUserRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.AdminUserDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.user.UserDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.user.UserStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.UserService;

@Slf4j
@Validated
@RestController
@RequestMapping("/admin/user-management")
@Tag(name = "User Management Controller")
@RequiredArgsConstructor
public class UserManagementController {
    private final UserService userService;

    @PostMapping("/get-all-users")
    public BaseResponse<PageResponse<UserDetailResponse>> getAllUsersWithCondition(@Valid @RequestBody BaseRequest<GetUserRequest> request) {
        return userService.getAllUsersWithCondition(request);
    }

    @GetMapping("/{id}")
    public BaseResponse<UserDetailResponse> getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping("/detail/{id}")
    public BaseResponse<AdminUserDetailResponse> getAdminUserDetailById(@PathVariable Long id) {
        return userService.getAdminUserDetailById(id);
    }

    @DeleteMapping("/delete/{id}")
    public BaseResponse<Void> deleteUser(@PathVariable Long id) {
        return userService.deleteUser(id);
    }

    @GetMapping("/statistics")
    public BaseResponse<UserStatisticsResponse> getUserStatistics() {
        return userService.getUserStatistics();
    }

    @PutMapping("/toggle-status/{id}")
    public BaseResponse<Void> toggleUserStatus(@PathVariable Long id) {
        return userService.toggleBlockUser(id);
    }

    @PostMapping("/reject-mentor")
    public BaseResponse<Void> rejectMentor(@Valid @RequestBody vn.fpt.se18.MentorLinking_BackEnd.dto.request.user.RejectMentorRequest request) {
        return userService.rejectMentor(request.getUserId(), request.getReason());
    }
}
