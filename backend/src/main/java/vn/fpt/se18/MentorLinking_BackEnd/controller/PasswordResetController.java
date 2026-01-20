package vn.fpt.se18.MentorLinking_BackEnd.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.ForgotPasswordRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.ResetPasswordRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.PasswordResetService;

@Slf4j
@RestController
@RequestMapping("/auth/password")
@Tag(name = "Password Reset Controller")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot")
    @Operation(summary = "Gửi email reset password")
    public BaseResponse<String> forgotPassword(@Valid @RequestBody BaseRequest<ForgotPasswordRequest> request) {
        log.info("🔄 Yêu cầu reset password cho email: {}", request.getData().getEmail());

        try {
            BaseResponse<String> response = passwordResetService.sendResetPasswordEmail(request.getData().getEmail());
            response.setRequestDateTime(request.getRequestDateTime());
            return response;

        } catch (Exception e) {
            log.error("❌ Lỗi khi xử lý yêu cầu reset password: {}", e.getMessage());
            return BaseResponse.<String>builder()
                    .requestDateTime(request.getRequestDateTime())
                    .respCode("1")
                    .description("Yêu cầu reset password thất bại")
                    .data("Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.")
                    .build();
        }
    }

    @GetMapping("/validate-token")
    @Operation(summary = "Validate token reset password")
    public BaseResponse<String> validateResetToken(@RequestParam String token) {
        log.info("🔍 Validate token reset password");

        try {
            return passwordResetService.validateResetToken(token);

        } catch (Exception e) {
            log.error("❌ Lỗi khi validate token: {}", e.getMessage());
            return BaseResponse.<String>builder()
                    .respCode("1")
                    .description("Validate token thất bại")
                    .data("Có lỗi xảy ra khi kiểm tra token.")
                    .build();
        }
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset password với token")
    public BaseResponse<String> resetPassword(@Valid @RequestBody BaseRequest<ResetPasswordRequest> request) {
        log.info("🔄 Reset password với token");

        try {
            ResetPasswordRequest data = request.getData();
            
            // Kiểm tra mật khẩu và xác nhận mật khẩu có khớp không
            if (!data.getNewPassword().equals(data.getConfirmPassword())) {
                return BaseResponse.<String>builder()
                        .requestDateTime(request.getRequestDateTime())
                        .respCode("1")
                        .description("Mật khẩu không khớp")
                        .data("Mật khẩu mới và xác nhận mật khẩu không khớp")
                        .build();
            }

            BaseResponse<String> response = passwordResetService.resetPassword(data.getToken(), data.getNewPassword());
            response.setRequestDateTime(request.getRequestDateTime());
            return response;

        } catch (Exception e) {
            log.error("❌ Lỗi khi reset password: {}", e.getMessage());
            return BaseResponse.<String>builder()
                    .requestDateTime(request.getRequestDateTime())
                    .respCode("1")
                    .description("Reset password thất bại")
                    .data("Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.")
                    .build();
        }
    }

    @GetMapping("/check-email")
    @Operation(summary = "Kiểm tra email có tồn tại không")
    public BaseResponse<Boolean> checkEmailExists(@RequestParam String email) {
        log.info("🔍 Kiểm tra email tồn tại: {}", email);

        try {
            boolean exists = passwordResetService.isEmailExists(email);
            return BaseResponse.<Boolean>builder()
                    .respCode("0")
                    .description("Kiểm tra email thành công")
                    .data(exists)
                    .build();

        } catch (Exception e) {
            log.error("❌ Lỗi khi kiểm tra email: {}", e.getMessage());
            return BaseResponse.<Boolean>builder()
                    .respCode("1")
                    .description("Kiểm tra email thất bại")
                    .data(false)
                    .build();
        }
    }
}