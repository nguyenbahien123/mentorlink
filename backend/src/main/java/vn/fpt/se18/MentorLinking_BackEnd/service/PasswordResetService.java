package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.ForgotPasswordRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.ResetPasswordRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;

public interface PasswordResetService {

    /**
     * Gửi email reset password
     * @param email email người dùng
     * @return BaseResponse với thông tin kết quả
     */
    BaseResponse<String> sendResetPasswordEmail(String email);

    /**
     * Validate token reset password
     * @param token token từ URL
     * @return BaseResponse với thông tin kết quả
     */
    BaseResponse<String> validateResetToken(String token);

    /**
     * Reset password với token
     * @param token token từ URL
     * @param newPassword mật khẩu mới
     * @return BaseResponse với thông tin kết quả
     */
    BaseResponse<String> resetPassword(String token, String newPassword);

    /**
     * Kiểm tra email có tồn tại trong hệ thống không
     * @param email email cần kiểm tra
     * @return true nếu email tồn tại
     */
    boolean isEmailExists(String email);

    /**
     * Dọn dẹp các token đã hết hạn
     */
    void cleanupExpiredTokens();
}