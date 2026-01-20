package vn.fpt.se18.MentorLinking_BackEnd.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.OtpVerificationRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.SendOtpRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.service.OtpService;

@Slf4j
@RestController
@RequestMapping("/auth/otp")
@Tag(name = "OTP Verification Controller")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/send")
    @Operation(summary = "Gửi mã OTP qua email")
    public BaseResponse<String> sendOtp(@Valid @RequestBody BaseRequest<SendOtpRequest> request) {
        log.info("🔄 Gửi OTP đến email: {}", request.getData().getEmail());

        try {
            boolean success = otpService.generateAndSendOtp(request.getData().getEmail());

            if (success) {
                return BaseResponse.<String>builder()
                        .requestDateTime(request.getRequestDateTime())
                        .respCode("0")
                        .description("Mã OTP đã được gửi thành công")
                        .data("OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.")
                        .build();
            } else {
                return BaseResponse.<String>builder()
                        .requestDateTime(request.getRequestDateTime())
                        .respCode("1")
                        .description("Gửi OTP thất bại")
                        .data("Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại.")
                        .build();
            }
        } catch (AppException e) {
            // Xử lý trường hợp email đã tồn tại
            log.warn("❌ Lỗi khi gửi OTP: {}", e.getMessage());
            return BaseResponse.<String>builder()
                    .requestDateTime(request.getRequestDateTime())
                    .respCode("1")
                    .description("Email đã được sử dụng")
                    .data(e.getMessage())
                    .build();
        }
    }

    @PostMapping("/verify")
    @Operation(summary = "Xác thực mã OTP")
    public BaseResponse<String> verifyOtp(@Valid @RequestBody BaseRequest<OtpVerificationRequest> request) {
        log.info("🔍 Xác thực OTP cho email: {}", request.getData().getEmail());

        boolean isValid = otpService.verifyOtp(
                request.getData().getEmail(),
                request.getData().getOtpCode()
        );

        if (isValid) {
            return BaseResponse.<String>builder()
                    .requestDateTime(request.getRequestDateTime())
                    .respCode("0")
                    .description("Xác thực OTP thành công")
                    .data("OTP hợp lệ. Bạn có thể tiếp tục đăng ký.")
                    .build();
        } else {
            return BaseResponse.<String>builder()
                    .requestDateTime(request.getRequestDateTime())
                    .respCode("1")
                    .description("Xác thực OTP thất bại")
                    .data("Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.")
                    .build();
        }
    }

    @PostMapping("/resend")
    @Operation(summary = "Gửi lại mã OTP")
    public BaseResponse<String> resendOtp(@Valid @RequestBody BaseRequest<SendOtpRequest> request) {
        log.info("🔄 Gửi lại OTP đến email: {}", request.getData().getEmail());

        try {
            boolean success = otpService.resendOtp(request.getData().getEmail());

            if (success) {
                return BaseResponse.<String>builder()
                        .requestDateTime(request.getRequestDateTime())
                        .respCode("0")
                        .description("Mã OTP mới đã được gửi thành công")
                        .data("Mã OTP mới đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.")
                        .build();
            } else {
                return BaseResponse.<String>builder()
                        .requestDateTime(request.getRequestDateTime())
                        .respCode("1")
                        .description("Gửi lại OTP thất bại")
                        .data("Có lỗi xảy ra khi gửi OTP mới. Vui lòng thử lại.")
                        .build();
            }
        } catch (AppException e) {
            // Xử lý trường hợp email đã tồn tại
            log.warn("❌ Lỗi khi gửi lại OTP: {}", e.getMessage());
            return BaseResponse.<String>builder()
                    .requestDateTime(request.getRequestDateTime())
                    .respCode("1")
                    .description("Email đã được sử dụng")
                    .data(e.getMessage())
                    .build();
        }
    }
}
