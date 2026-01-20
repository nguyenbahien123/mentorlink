package vn.fpt.se18.MentorLinking_BackEnd.service;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.user.GetUserRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.user.UserRequestDTO;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.AdminUserDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.user.UserDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.user.UserStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;

import java.util.List;

@Service
public interface UserService {

    UserDetailsService userDetailsService();

    User getByUsername(String userName);

    long saveUser(UserRequestDTO request);

    void saveUser(User user);

    List<String> getAllRolesByUserId(long userId);

    User getUserByEmail(String email);

    BaseResponse<PageResponse<UserDetailResponse>> getAllUsersWithCondition(BaseRequest<GetUserRequest> request);


    BaseResponse<UserDetailResponse> getUserById(Long id);

    BaseResponse<AdminUserDetailResponse> getAdminUserDetailById(Long id);

    BaseResponse<Void> deleteUser(Long id);

    BaseResponse<UserStatisticsResponse> getUserStatistics();

    BaseResponse<Void> toggleBlockUser(Long id);

    BaseResponse<Void> rejectMentor(Long userId, String reason);
}
