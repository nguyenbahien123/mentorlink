package vn.fpt.se18.MentorLinking_BackEnd.service;

import jakarta.servlet.http.HttpServletRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.ResetPasswordDTO;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.SignInRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.SignUpMentorRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.SignUpMentorWithOtpRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.SignUpRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.SignUpWithOtpRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.auth.TokenResponse;


public interface AuthenticationService {
    TokenResponse accessToken(SignInRequest request);

    TokenResponse refreshToken(HttpServletRequest request);

    String removeToken(HttpServletRequest request);

    String forgotPassword(String email);

    String resetPassword(String secretKey);

    String changePassword(ResetPasswordDTO request);

    TokenResponse signUp(SignUpRequest request);

    TokenResponse signUpMentor(SignUpMentorRequest request);

    TokenResponse signUpWithOtp(SignUpWithOtpRequest request);

    TokenResponse signUpMentorWithOtp(SignUpMentorWithOtpRequest request);
}