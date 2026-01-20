package vn.fpt.se18.MentorLinking_BackEnd.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.user.UpdateProfileRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.user.ProfileResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.service.UserService;
import vn.fpt.se18.MentorLinking_BackEnd.service.UploadImageFile;

import java.io.IOException;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@Tag(name = "Profile Controller")
@Slf4j
public class ProfileController {

    private final UserService userService;
    private final UploadImageFile uploadImageFile;

    @GetMapping
    public BaseResponse<ProfileResponse> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Unauthorized");
        }

        String email = authentication.getName();
        User user = userService.getUserByEmail(email);

        ProfileResponse profile = mapToProfileResponse(user);

        return BaseResponse.<ProfileResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get profile successfully")
                .data(profile)
                .build();
    }

    @PutMapping
    public BaseResponse<ProfileResponse> updateProfile(@Valid @ModelAttribute UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Unauthorized");
        }

        String email = authentication.getName();
        User user = userService.getUserByEmail(email);

        // Update allowed fields (exclude email)
        if (request.getFullname() != null) user.setFullname(request.getFullname());
        if (request.getDob() != null) user.setDob(request.getDob());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getCurrentLocation() != null) user.setCurrentLocation(request.getCurrentLocation());
        if (request.getTitle() != null) user.setTitle(request.getTitle());
        if (request.getLinkedinUrl() != null) user.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getIntro() != null) user.setIntro(request.getIntro());
        if (request.getBankAccountNumber() != null) user.setBankAccountNumber(request.getBankAccountNumber());
        if (request.getBankName() != null) user.setBankName(request.getBankName());

        // Handle avatar upload
        if (request.getAvatarFile() != null && !request.getAvatarFile().isEmpty()) {
            try {
                String avatarUrl = uploadImageFile.uploadImage(request.getAvatarFile());
                user.setAvatarUrl(avatarUrl);
                log.info("Avatar uploaded successfully for user {}: {}", email, avatarUrl);
            } catch (IOException e) {
                log.error("Failed to upload avatar for user {}: {}", email, e.getMessage());
                throw new AppException(ErrorCode.UNCATEGORIZED, "Failed to upload avatar: " + e.getMessage());
            }
        } else if (request.getAvatarUrl() != null) {
            // If no file upload but avatarUrl is provided, use the URL directly
            user.setAvatarUrl(request.getAvatarUrl());
        }

        userService.saveUser(user);

        ProfileResponse profile = mapToProfileResponse(user);

        return BaseResponse.<ProfileResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Update profile successfully")
                .data(profile)
                .build();
    }

    private ProfileResponse mapToProfileResponse(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullname(user.getFullname())
                .dob(user.getDob())
                .phone(user.getPhone())
                .gender(user.getGender())
                .address(user.getAddress())
                .currentLocation(user.getCurrentLocation())
                .title(user.getTitle())
                .linkedinUrl(user.getLinkedinUrl())
                .avatarUrl(user.getAvatarUrl())
                .intro(user.getIntro())
                .rating(user.getRating())
                .numberOfBooking(user.getNumberOfBooking())
                .bankAccountNumber(user.getBankAccountNumber())
                .bankName(user.getBankName())
                .build();
    }
}
