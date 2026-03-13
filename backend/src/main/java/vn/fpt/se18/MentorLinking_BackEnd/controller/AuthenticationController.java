package vn.fpt.se18.MentorLinking_BackEnd.controller;


import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
    public ResponseEntity<TokenResponse> accessToken(@RequestBody SignInRequest request, HttpServletResponse response) {
        // Temporary debug logging: do not log raw passwords in production
        log.info("Login attempt for email='{}', passwordLength={}",
            request.getEmail(), request.getPassword() == null ? 0 : request.getPassword().length());

        TokenResponse tokenResponse = authenticationService.accessToken(request);
        
        // Set refreshToken as HttpOnly cookie
        setRefreshTokenCookie(response, tokenResponse.getRefreshToken());
        
        // Return only accessToken in response body (không trả refreshToken)
        return new ResponseEntity<>(TokenResponse.builder()
                .accessToken(tokenResponse.getAccessToken())
                .userId(tokenResponse.getUserId())
                .build(), OK);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponse> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        TokenResponse tokenResponse = authenticationService.refreshToken(request);
        
        // Set new refreshToken as HttpOnly cookie
        setRefreshTokenCookie(response, tokenResponse.getRefreshToken());
        
        // Return only accessToken in response body
        return new ResponseEntity<>(TokenResponse.builder()
                .accessToken(tokenResponse.getAccessToken())
                .userId(tokenResponse.getUserId())
                .build(), OK);
    }

    @PostMapping("/remove-token")
    public ResponseEntity<String> removeToken(HttpServletRequest request, HttpServletResponse response) {
        String result = authenticationService.removeToken(request);
        
        // Clear refreshToken cookie
        clearRefreshTokenCookie(response);
        
        return new ResponseEntity<>(result, OK);
    }


    @PostMapping("/login")
    public BaseResponse<TokenResponse> login(@Valid @RequestBody BaseRequest<SignInRequest> request, HttpServletResponse response) {
        TokenResponse tokenResponse = authenticationService.accessToken(request.getData());
        
        // Set refreshToken as HttpOnly cookie
        setRefreshTokenCookie(response, tokenResponse.getRefreshToken());
        
        return BaseResponse.<TokenResponse>builder()
                .requestDateTime(request.getRequestDateTime())
                .respCode("0")
                .description("Login successfully")
                .data(TokenResponse.builder()
                        .accessToken(tokenResponse.getAccessToken())
                        .userId(tokenResponse.getUserId())
                        .build())
                .build();
    }

    @PostMapping("/signup")
    public BaseResponse<TokenResponse> signUp(@Valid @RequestBody BaseRequest<SignUpRequest> request, HttpServletResponse response) {
        TokenResponse tokenResponse = authenticationService.signUp(request.getData());
        
        // Set refreshToken as HttpOnly cookie
        setRefreshTokenCookie(response, tokenResponse.getRefreshToken());
        
        return BaseResponse.<TokenResponse>builder()
                .requestDateTime(request.getRequestDateTime())
                .respCode("0")
                .description("User registered successfully")
                .data(TokenResponse.builder()
                        .accessToken(tokenResponse.getAccessToken())
                        .userId(tokenResponse.getUserId())
                        .build())
                .build();
    }

    @PostMapping(value = "/mentor-signup", consumes = {"multipart/form-data"})
    public BaseResponse<TokenResponse> MentorSignUp(@Valid @ModelAttribute SignUpMentorRequest request, HttpServletResponse response) {
        log.info("Checking email: '{}'", request.getEmail());
        log.info("Checking fullName: '{}'", request.getFullName());

        TokenResponse tokenResponse = authenticationService.signUpMentor(request);
        
        // Set refreshToken as HttpOnly cookie
        setRefreshTokenCookie(response, tokenResponse.getRefreshToken());
        
        return BaseResponse.<TokenResponse>builder()
                .requestDateTime(String.valueOf(java.time.LocalDateTime.now()))
                .respCode("0")
                .description("Mentor registered successfully")
                .data(TokenResponse.builder()
                        .accessToken(tokenResponse.getAccessToken())
                        .userId(tokenResponse.getUserId())
                        .build())
                .build();
    }

    @PostMapping("/signup-with-otp")
    public BaseResponse<TokenResponse> signUpWithOtp(@Valid @RequestBody BaseRequest<SignUpWithOtpRequest> request, HttpServletResponse response) {
        log.info("🔐 Đăng ký với OTP cho email: {}", request.getData().getEmail());

        TokenResponse tokenResponse = authenticationService.signUpWithOtp(request.getData());
        
        // Set refreshToken as HttpOnly cookie
        setRefreshTokenCookie(response, tokenResponse.getRefreshToken());
        
        return BaseResponse.<TokenResponse>builder()
                .requestDateTime(request.getRequestDateTime())
                .respCode("0")
                .description("Đăng ký thành công với xác thực OTP")
                .data(TokenResponse.builder()
                        .accessToken(tokenResponse.getAccessToken())
                        .userId(tokenResponse.getUserId())
                        .build())
                .build();
    }

    @PostMapping(value = "/mentor-signup-with-otp", consumes = {"multipart/form-data"})
    public BaseResponse<TokenResponse> mentorSignUpWithOtp(@Valid @ModelAttribute SignUpMentorWithOtpRequest request, HttpServletResponse response) {
        log.info("🔐 Đăng ký mentor với OTP cho email: '{}'", request.getEmail());
        log.info("🔐 Đăng ký mentor với OTP cho họ tên: '{}'", request.getFullName());

        TokenResponse tokenResponse = authenticationService.signUpMentorWithOtp(request);
        
        // Set refreshToken as HttpOnly cookie
        setRefreshTokenCookie(response, tokenResponse.getRefreshToken());
        
        return BaseResponse.<TokenResponse>builder()
                .requestDateTime(String.valueOf(java.time.LocalDateTime.now()))
                .respCode("0")
                .description("Đăng ký mentor thành công với xác thực OTP")
                .data(TokenResponse.builder()
                        .accessToken(tokenResponse.getAccessToken())
                        .userId(tokenResponse.getUserId())
                        .build())
                .build();
    }
    
    // Helper methods to manage HttpOnly cookies
    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // Set to true for HTTPS in production
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        // cookie.setSameSite("Lax"); // Requires Servlet 6.0+, or set via header
        response.addCookie(cookie);
        
        // Alternative: Set SameSite via header for older Servlet versions
        response.addHeader("Set-Cookie", String.format(
            "refreshToken=%s; Path=/; HttpOnly; Secure; Max-Age=%d; SameSite=Lax",
            refreshToken, 7 * 24 * 60 * 60
        ));
    }
    
    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // Set to true for HTTPS in production
        cookie.setPath("/");
        cookie.setMaxAge(0); // Delete cookie
        response.addCookie(cookie);
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
