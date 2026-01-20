package vn.fpt.se18.MentorLinking_BackEnd.controller;


import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.auth.TokenResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.AuthenticationService;

import static org.springframework.http.HttpStatus.OK;


@Slf4j
@Validated
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication Controller")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/access-token")
    public ResponseEntity<TokenResponse> accessToken(@RequestBody SignInRequest request) {
        return new ResponseEntity<>(authenticationService.accessToken(request), OK);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponse> refreshToken(HttpServletRequest request) {
        return new ResponseEntity<>(authenticationService.refreshToken(request), OK);
    }

    @PostMapping("/remove-token")
    public ResponseEntity<String> removeToken(HttpServletRequest request) {
        return new ResponseEntity<>(authenticationService.removeToken(request), OK);
    }


    @PostMapping("/login")
    public BaseResponse<TokenResponse> login(@Valid @RequestBody BaseRequest<SignInRequest> request) {
        TokenResponse tokenResponse = authenticationService.accessToken(request.getData());
        return BaseResponse.<TokenResponse>builder()
                .requestDateTime(request.getRequestDateTime())
                .respCode("0")
                .description("Login successfully")
                .data(tokenResponse)
                .build();
    }

    @PostMapping("/signup")
    public BaseResponse<TokenResponse> signUp(@Valid @RequestBody BaseRequest<SignUpRequest> request) {
        TokenResponse tokenResponse = authenticationService.signUp(request.getData());
        return BaseResponse.<TokenResponse>builder()
                .requestDateTime(request.getRequestDateTime())
                .respCode("0")
                .description("User registered successfully")
                .data(tokenResponse)
                .build();
    }

    @PostMapping(value = "/mentor-signup", consumes = {"multipart/form-data"})
    public BaseResponse<TokenResponse> MentorSignUp(@Valid @ModelAttribute SignUpMentorRequest request) {
        log.info("Checking email: '{}'", request.getEmail());
        log.info("Checking fullName: '{}'", request.getFullName());

        TokenResponse tokenResponse = authenticationService.signUpMentor(request);
        return BaseResponse.<TokenResponse>builder()
                .requestDateTime(String.valueOf(java.time.LocalDateTime.now()))
                .respCode("0")
                .description("Mentor registered successfully")
                .data(tokenResponse)
                .build();
    }

    @PostMapping("/signup-with-otp")
    public BaseResponse<TokenResponse> signUpWithOtp(@Valid @RequestBody BaseRequest<SignUpWithOtpRequest> request) {
        log.info("🔐 Đăng ký với OTP cho email: {}", request.getData().getEmail());

        TokenResponse tokenResponse = authenticationService.signUpWithOtp(request.getData());
        return BaseResponse.<TokenResponse>builder()
                .requestDateTime(request.getRequestDateTime())
                .respCode("0")
                .description("Đăng ký thành công với xác thực OTP")
                .data(tokenResponse)
                .build();
    }

    @PostMapping(value = "/mentor-signup-with-otp", consumes = {"multipart/form-data"})
    public BaseResponse<TokenResponse> mentorSignUpWithOtp(@Valid @ModelAttribute SignUpMentorWithOtpRequest request) {
        log.info("🔐 Đăng ký mentor với OTP cho email: '{}'", request.getEmail());
        log.info("🔐 Đăng ký mentor với OTP cho họ tên: '{}'", request.getFullName());

        TokenResponse tokenResponse = authenticationService.signUpMentorWithOtp(request);
        return BaseResponse.<TokenResponse>builder()
                .requestDateTime(String.valueOf(java.time.LocalDateTime.now()))
                .respCode("0")
                .description("Đăng ký mentor thành công với xác thực OTP")
                .data(tokenResponse)
                .build();
    }



//    @PostMapping("/forgot-password")
//    public ResponseEntity<String> forgotPassword(@RequestBody String email) {
//        return new ResponseEntity<>(authenticationService.forgotPassword(email), OK);
//    }
//
//    @PostMapping("/reset-password")
//    public ResponseEntity<String> resetPassword(@RequestBody String secretKey) {
//        return new ResponseEntity<>(authenticationService.resetPassword(secretKey), OK);
//    }
//
//    @PostMapping("/change-password")
//    public ResponseEntity<String> changePassword(@RequestBody @Valid ResetPasswordDTO request) {
//        return new ResponseEntity<>(authenticationService.changePassword(request), OK);
//    }
}
