package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.ResetPasswordDTO;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.SignInRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.SignUpMentorRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.SignUpMentorWithOtpRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.SignUpRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth.SignUpWithOtpRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.auth.TokenResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.*;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.*;
import vn.fpt.se18.MentorLinking_BackEnd.service.AuthenticationService;
import vn.fpt.se18.MentorLinking_BackEnd.service.JwtService;
import vn.fpt.se18.MentorLinking_BackEnd.service.TokenService;
import vn.fpt.se18.MentorLinking_BackEnd.service.UserService;
import vn.fpt.se18.MentorLinking_BackEnd.service.UploadImageFile;
import vn.fpt.se18.MentorLinking_BackEnd.service.OtpService;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode.UNCATEGORIZED;
import static vn.fpt.se18.MentorLinking_BackEnd.util.TokenType.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenService tokenService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;


    private final MentorEducationRepository mentorEducationRepository;
    private final MentorExperienceRepository mentorExperienceRepository;
    private final MentorTestRepository mentorTestRepository;
    private final HighestDegreeRepository highestDegreeRepository;
    private final StatusRepository statusRepository;
    private final UploadImageFile uploadImageFile;
    private final CountryRepository countryRepository;
    private final MentorCountryRepository mentorCountryRepository;
    private final OtpService otpService;


    @Override
    public TokenResponse accessToken(SignInRequest request) {
        log.info("---------- authenticate ----------");

        // authenticate
        var user = userService.getUserByEmail(request.getEmail());

        // Check if account is locked
        if (user.getIsBlocked() != null && user.getIsBlocked()) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED);
        }

        // Check if user is mentor with PENDING status
        if (user.getRole().getName().equals("MENTOR") &&
            user.getStatus() != null && user.getStatus().getCode().equals("PENDING")) {
            throw new AppException(ErrorCode.MENTOR_PENDING_APPROVAL);
        }

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().getName()))
        ));

        // generate token
        var accessToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        // save to db - use email consistently
        tokenService.save(Token.builder()
                .username(user.getEmail()) // Use email instead of username
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .build();
    }

    @Override
    public TokenResponse refreshToken(HttpServletRequest request) {
        log.info("---------- refreshToken ----------");
        final String authorization = request.getHeader(AUTHORIZATION);
        if (StringUtils.isBlank(authorization) || !authorization.startsWith("Bearer ")) {
            throw new AppException(UNCATEGORIZED);
        }

        final String refreshToken = authorization.substring(7);
        final String email = jwtService.extractUsername(refreshToken, REFRESH_TOKEN);

        if (StringUtils.isNotBlank(email)) {
            var user = userService.getUserByEmail(email);
            var storedToken = tokenService.getByUsername(user.getEmail()); // Use email consistently

            if (jwtService.isValid(refreshToken, REFRESH_TOKEN, user) &&
                    refreshToken.equals(storedToken.getRefreshToken())) {
                var accessToken = jwtService.generateToken(user);
                var newRefreshToken = jwtService.generateRefreshToken(user);

                tokenService.save(Token.builder()
                        .username(user.getEmail()) // Use email consistently
                        .accessToken(accessToken)
                        .refreshToken(newRefreshToken)
                        .build());

                return TokenResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(newRefreshToken)
                        .userId(user.getId())
                        .build();
            }
        }
        throw new AppException(UNCATEGORIZED);
    }
    @Override
    public String removeToken(HttpServletRequest request) {
        log.info("---------- removeToken ----------");

        // get token from request
        final String authorization = request.getHeader(AUTHORIZATION);
        final String token;
        final String userName;

        if (StringUtils.isBlank(authorization) || !authorization.startsWith("Bearer ")) {
            throw new AppException(UNCATEGORIZED);
        }

        token = authorization.substring(7);
        userName = jwtService.extractUsername(token, ACCESS_TOKEN);

        // remove token from db
        tokenService.delete(userName);

        return "Remove token successfully";
    }

    @Override
    public String forgotPassword(String email) {
        log.info("---------- forgotPassword ----------");

        // check email exists or not
        User user = userService.getUserByEmail(email);

        // generate reset token
        String resetToken = jwtService.generateResetToken(user);

        // save to db
        tokenService.save(Token.builder()
                .username(user.getUsername())
                .resetToken(resetToken)
                .build());

        // TODO send email to user
        String confirmLink = String.format("curl --location 'http://localhost:80/auth/reset-password' \\\n" +
                "--header 'accept: */*' \\\n" +
                "--header 'Content-Type: application/json' \\\n" +
                "--data '%s'", resetToken);
        log.info("--> confirmLink: {}", confirmLink);

        return resetToken;
    }

    @Override
    public String resetPassword(String secretKey) {
        log.info("---------- resetPassword ----------");

        // validate token
        var user = validateToken(secretKey);

        // check token by username
        tokenService.getByUsername(user.getUsername());

        return "Reset";
    }

    @Override
    public String changePassword(ResetPasswordDTO request) {
        log.info("---------- changePassword ----------");

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new AppException(UNCATEGORIZED);
        }

        // get user by reset token
        var user = validateToken(request.getSecretKey());

        // update password
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userService.saveUser(user);

        return "Password changed successfully";
    }

    @Override
    public TokenResponse signUp(SignUpRequest request) {
        log.info("---------- signUp ----------");

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.UNCATEGORIZED, "Password and confirm password do not match");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AppException(ErrorCode.UNCATEGORIZED, "Email already exists");
        }

        // Get role or set default role
        Role role = roleRepository.findByName("CUSTOMER")
                    .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED, "Default role not found"));

        // Get APPROVED status for CUSTOMER
        Status approvedStatus = statusRepository.findByCode("APPROVED")
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED, "Approved status not found"));

        User user = User.builder()
                .username(request.getEmail()) // Set username to email for consistency
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullname(request.getFullName())
                .role(role)
                .status(approvedStatus) // Set status to APPROVED for CUSTOMER
                .isBlocked(false)
                .build();

        userRepository.save(user);

        // Generate tokens
        var accessToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        // Save tokens to db - use email consistently
        tokenService.save(Token.builder()
                .username(user.getEmail()) // Use email instead of username
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .build();
    }

    @Override
    @Transactional
    public TokenResponse signUpMentor(SignUpMentorRequest request) {
        log.info("---------- signUpMentor ----------");
        
        // Trim email to remove whitespace
        String email = request.getEmail() != null ? request.getEmail().trim() : null;
        log.info("Checking email: '{}'", email);
        
        // Check if email exists
        Optional<User> existingUserByEmail = userRepository.findByEmail(email);
        if (existingUserByEmail.isPresent()) {
            log.warn("Email already exists: {}", email);
            throw new AppException(ErrorCode.UNCATEGORIZED, "Email already exists");
        }
        
        // Check if username exists (username is set to email)
        Optional<User> existingUserByUsername = userRepository.findByUsername(email);
        if (existingUserByUsername.isPresent()) {
            log.warn("Username (email) already exists: {}", email);
            throw new AppException(ErrorCode.UNCATEGORIZED, "Email already exists");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.UNCATEGORIZED, "Password and confirm password do not match");
        }

        // Get role or set default role
        Role role = roleRepository.findByName("MENTOR")
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED, "Default role not found"));

        // Get PENDING status for mentor-related entities
        Status pendingStatus = statusRepository.findByCode("PENDING")
                .orElseThrow(() -> new IllegalArgumentException("Pending status not found"));

        // Get highest degree
        HighestDegree highestDegree = null;
        if (request.getLevelOfEducation() != null && !request.getLevelOfEducation().isEmpty()) {
            highestDegree = highestDegreeRepository.findByName(request.getLevelOfEducation())
                    .orElse(null);
        }

        // Upload avatar if provided
        String avatarUrl = null;
        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            try {
                avatarUrl = uploadImageFile.uploadImage(request.getAvatar());
                log.info("Avatar uploaded successfully: {}", avatarUrl);
            } catch (IOException e) {
                log.error("Failed to upload avatar: {}", e.getMessage());
                throw new AppException(ErrorCode.UNCATEGORIZED, "Failed to upload avatar: " + e.getMessage());
            }
        }

        // Create and save user with PENDING status initially
        User user = User.builder()
                .username(email)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .fullname(request.getFullName())
                .dob(request.getDob())
                .phone(request.getPhone())
                .address(request.getAddress())
                .title(request.getTitle())
                .highestDegree(highestDegree)
                .linkedinUrl(request.getLinkedUrl())
                .avatarUrl(avatarUrl)
                .intro(request.getIntroduceYourself())
                .status(pendingStatus) // Set user status to PENDING for review
                .isBlocked(false)
                .rating(0.0f)
                .numberOfBooking(0)
                .lastLogin(LocalDateTime.now())
                .build();

        user = userRepository.save(user);

        // Save mentor educations with PENDING status
        if (request.getMentorEducations() != null && !request.getMentorEducations().isEmpty()) {
            for (SignUpMentorRequest.MentorEducation education : request.getMentorEducations()) {
                List<String> certificateUrls = new ArrayList<>();

                if (education.getDegreesFile() != null && !education.getDegreesFile().isEmpty()) {
                    try {
                        String certificateUrl = uploadImageFile.uploadImage(education.getDegreesFile());
                        certificateUrls.add(certificateUrl);
                        log.info("Certificate uploaded successfully: {}", certificateUrl);
                    } catch (IOException e) {
                        log.error("Failed to upload certificate for education {}: {}", education.getSchoolName(), e.getMessage());
                        throw new AppException(ErrorCode.UNCATEGORIZED, "Failed to upload certificate: " + e.getMessage());
                    }
                }

                MentorEducation mentorEducation = MentorEducation.builder()
                        .user(user)
                        .schoolName(education.getSchoolName())
                        .major(education.getMajor())
                        .startDate(education.getStartDate())
                        .endDate(education.getEndDate())
                        .certificateImage(String.join(",", certificateUrls))
                        .status(pendingStatus) // Set status to PENDING for admin review
                        .createdBy(user)
                        .updatedBy(user)
                        .build();

                mentorEducationRepository.save(mentorEducation);
            }
        }

        // Save mentor experiences with PENDING status
        if (request.getExperiences() != null && !request.getExperiences().isEmpty()) {
            for (SignUpMentorRequest.Experience experience : request.getExperiences()) {
                List<String> experienceUrls = new ArrayList<>();

                if (experience.getExperiencesFile() != null && !experience.getExperiencesFile().isEmpty()) {
                    try {
                        String experienceUrl = uploadImageFile.uploadImage(experience.getExperiencesFile());
                        experienceUrls.add(experienceUrl);
                        log.info("Experience file uploaded successfully: {}", experienceUrl);
                    } catch (IOException e) {
                        log.error("Failed to upload experience file for {}: {}", experience.getCompany(), e.getMessage());
                        throw new AppException(ErrorCode.UNCATEGORIZED, "Failed to upload experience file: " + e.getMessage());
                    }
                }

                MentorExperience mentorExperience = MentorExperience.builder()
                        .user(user)
                        .companyName(experience.getCompany())
                        .position(experience.getPosition())
                        .startDate(experience.getStartDate())
                        .endDate(experience.getEndDate())
                        .experienceImage(String.join(",", experienceUrls))
                        .status(pendingStatus) // Set status to PENDING for admin review
                        .createdBy(user)
                        .updatedBy(user)
                        .build();

                mentorExperienceRepository.save(mentorExperience);
            }
        }

        // Save mentor tests/certificates with PENDING status
        if (request.getCertificates() != null && !request.getCertificates().isEmpty()) {
            for (SignUpMentorRequest.Certificate certificate : request.getCertificates()) {
                List<String> scoreUrls = new ArrayList<>();

                if (certificate.getCertificatesFile() != null && !certificate.getCertificatesFile().isEmpty()) {
                    try {
                        String scoreUrl = uploadImageFile.uploadImage(certificate.getCertificatesFile());
                        scoreUrls.add(scoreUrl);
                        log.info("Certificate file uploaded successfully: {}", scoreUrl);
                    } catch (IOException e) {
                        log.error("Failed to upload certificate file for {}: {}", certificate.getCertificateName(), e.getMessage());
                        throw new AppException(ErrorCode.UNCATEGORIZED, "Failed to upload certificate file: " + e.getMessage());
                    }
                }

                MentorTest mentorTest = MentorTest.builder()
                        .user(user)
                        .testName(certificate.getCertificateName())
                        .score(certificate.getScore())
                        .scoreImage(String.join(",", scoreUrls))
                        .status(pendingStatus) // Set status to PENDING for admin review
                        .createdBy(user)
                        .updatedBy(user)
                        .build();

                mentorTestRepository.save(mentorTest);
            }
        }

        // Save mentor countries
        if (request.getMentorCountries() != null && !request.getMentorCountries().isEmpty()) {
            Status approvedCountryStatus = statusRepository.findByCode("APPROVED")
                    .orElseThrow(() -> new IllegalArgumentException("Approved status not found"));

            for (SignUpMentorRequest.MentorCountryRequest countryRequest : request.getMentorCountries()) {
                Country country = null;
                Status mentorCountryStatus = pendingStatus;

                // Nếu không có countryId => đề xuất country mới
                if (countryRequest.getCountryName() != null && !countryRequest.getCountryName().isEmpty()) {
                    // Kiểm tra xem country đã tồn tại chưa (theo tên)
                    country = countryRepository.findByName(countryRequest.getCountryName())
                            .orElse(null);
                    
                    // Nếu chưa tồn tại => tạo mới với status PENDING
                    if (country == null) {
                        String countryCode = countryRequest.getCountryName();
                        if (countryCode != null && !countryCode.isEmpty()) {
                            countryCode = countryCode
                                    .toUpperCase()
                                    .replaceAll("\\s+", "");
                        }
                        
                        country = Country.builder()
                                .code(countryCode)
                                .name(countryRequest.getCountryName())
                                .description(countryRequest.getDescription())
                                .status(pendingStatus)
                                .createdBy(user)
                                .updatedBy(user)
                                .build();
                        
                        country = countryRepository.save(country);
                        // Country mới thì mentor country sẽ là PENDING (đã set ở trên)
                    } else {
                        // Country đã tồn tại, kiểm tra status của nó
                        if ("APPROVED".equals(country.getStatus().getCode())) {
                            mentorCountryStatus = approvedCountryStatus;
                        }
                    }
                }
                
                // Tạo MentorCountry
                if (country != null) {
                    MentorCountry mentorCountry = MentorCountry.builder()
                            .mentor(user)
                            .country(country)
                            .status(mentorCountryStatus)
                            .adminComment(countryRequest.getDescription()) // Lưu mô tả của mentor
                            .createdBy(user)
                            .updatedBy(user)
                            .build();
                    
                    mentorCountryRepository.save(mentorCountry);
                }
            }
        }

        // Generate tokens
        var accessToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .build();
    }

    @Override
    public TokenResponse signUpWithOtp(SignUpWithOtpRequest request) {
        log.info("---------- signUpWithOtp ----------");

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.UNCATEGORIZED, "Password and confirm password do not match");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AppException(ErrorCode.UNCATEGORIZED, "Email already exists");
        }

        // ✅ Xác thực OTP trước khi tạo tài khoản
        if (!otpService.verifyOtp(request.getEmail(), request.getOtpCode())) {
            throw new AppException(ErrorCode.UNCATEGORIZED, "Invalid or expired OTP");
        }

        // Get role or set default role
        Role role = roleRepository.findByName("CUSTOMER")
                    .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED, "Default role not found"));

        // Get APPROVED status for CUSTOMER
        Status approvedStatus = statusRepository.findByCode("APPROVED")
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED, "Approved status not found"));

        User user = User.builder()
                .username(request.getEmail()) // Set username to email for consistency
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullname(request.getFullName())
                .role(role)
                .status(approvedStatus) // Set status to APPROVED for CUSTOMER
                .isBlocked(false)
                .build();

        userRepository.save(user);

        // Generate tokens
        var accessToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        // Save tokens to db - use email consistently
        tokenService.save(Token.builder()
                .username(user.getEmail()) // Use email instead of username
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .build();
    }

    @Override
    @Transactional
    public TokenResponse signUpMentorWithOtp(SignUpMentorWithOtpRequest request) {
        log.info("---------- signUpMentorWithOtp ----------");

        // Trim email to remove whitespace
        String email = request.getEmail() != null ? request.getEmail().trim() : null;
        log.info("🔐 Đăng ký mentor với OTP cho email: '{}'", email);

        // ✅ Xác thực OTP TRƯỚC KHI kiểm tra và tạo tài khoản
        if (!otpService.verifyOtp(email, request.getOtpCode())) {
            throw new AppException(ErrorCode.UNCATEGORIZED, "Mã OTP không hợp lệ hoặc đã hết hạn");
        }

        // Check if email exists (double check)
        Optional<User> existingUserByEmail = userRepository.findByEmail(email);
        if (existingUserByEmail.isPresent()) {
            log.warn("Email already exists: {}", email);
            throw new AppException(ErrorCode.UNCATEGORIZED, "Email already exists");
        }

        // Check if username exists (username is set to email)
        Optional<User> existingUserByUsername = userRepository.findByUsername(email);
        if (existingUserByUsername.isPresent()) {
            log.warn("Username (email) already exists: {}", email);
            throw new AppException(ErrorCode.UNCATEGORIZED, "Email already exists");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.UNCATEGORIZED, "Password and confirm password do not match");
        }

        // Get role or set default role
        Role role = roleRepository.findByName("MENTOR")
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED, "Default role not found"));

        // Get PENDING status for mentor-related entities
        Status pendingStatus = statusRepository.findByCode("PENDING")
                .orElseThrow(() -> new IllegalArgumentException("Pending status not found"));

        // Get highest degree
        HighestDegree highestDegree = null;
        if (request.getLevelOfEducation() != null && !request.getLevelOfEducation().isEmpty()) {
            highestDegree = highestDegreeRepository.findByName(request.getLevelOfEducation())
                    .orElse(null);
        }

        // Upload avatar if provided
        String avatarUrl = null;
        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            try {
                avatarUrl = uploadImageFile.uploadImage(request.getAvatar());
                log.info("Avatar uploaded successfully: {}", avatarUrl);
            } catch (IOException e) {
                log.error("Failed to upload avatar: {}", e.getMessage());
                throw new AppException(ErrorCode.UNCATEGORIZED, "Failed to upload avatar: " + e.getMessage());
            }
        }

        // Create and save user with PENDING status initially
        User user = User.builder()
                .username(email)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .fullname(request.getFullName())
                .dob(request.getDob())
                .phone(request.getPhone())
                .address(request.getAddress())
                .title(request.getTitle())
                .highestDegree(highestDegree)
                .linkedinUrl(request.getLinkedUrl())
                .avatarUrl(avatarUrl)
                .intro(request.getIntroduceYourself())
                .status(pendingStatus) // Set user status to PENDING for review
                .isBlocked(false)
                .rating(0.0f)
                .numberOfBooking(0)
                .lastLogin(LocalDateTime.now())
                .build();

        user = userRepository.save(user);

        // Save mentor educations with PENDING status
        if (request.getMentorEducations() != null && !request.getMentorEducations().isEmpty()) {
            for (SignUpMentorWithOtpRequest.MentorEducation education : request.getMentorEducations()) {
                List<String> certificateUrls = new ArrayList<>();

                if (education.getDegreesFile() != null && !education.getDegreesFile().isEmpty()) {
                    try {
                        String certificateUrl = uploadImageFile.uploadImage(education.getDegreesFile());
                        certificateUrls.add(certificateUrl);
                        log.info("Certificate uploaded successfully: {}", certificateUrl);
                    } catch (IOException e) {
                        log.error("Failed to upload certificate for education {}: {}", education.getSchoolName(), e.getMessage());
                        throw new AppException(ErrorCode.UNCATEGORIZED, "Failed to upload certificate: " + e.getMessage());
                    }
                }

                MentorEducation mentorEducation = MentorEducation.builder()
                        .user(user)
                        .schoolName(education.getSchoolName())
                        .major(education.getMajor())
                        .startDate(education.getStartDate())
                        .endDate(education.getEndDate())
                        .certificateImage(String.join(",", certificateUrls))
                        .status(pendingStatus)
                        .createdBy(user)
                        .updatedBy(user)
                        .build();

                mentorEducationRepository.save(mentorEducation);
            }
        }

        // Save mentor experiences with PENDING status
        if (request.getExperiences() != null && !request.getExperiences().isEmpty()) {
            for (SignUpMentorWithOtpRequest.Experience experience : request.getExperiences()) {
                List<String> experienceUrls = new ArrayList<>();

                if (experience.getExperiencesFile() != null && !experience.getExperiencesFile().isEmpty()) {
                    try {
                        String experienceUrl = uploadImageFile.uploadImage(experience.getExperiencesFile());
                        experienceUrls.add(experienceUrl);
                        log.info("Experience file uploaded successfully: {}", experienceUrl);
                    } catch (IOException e) {
                        log.error("Failed to upload experience file for {}: {}", experience.getCompany(), e.getMessage());
                        throw new AppException(ErrorCode.UNCATEGORIZED, "Failed to upload experience file: " + e.getMessage());
                    }
                }

                MentorExperience mentorExperience = MentorExperience.builder()
                        .user(user)
                        .companyName(experience.getCompany())
                        .position(experience.getPosition())
                        .startDate(experience.getStartDate())
                        .endDate(experience.getEndDate())
                        .experienceImage(String.join(",", experienceUrls))
                        .status(pendingStatus)
                        .createdBy(user)
                        .updatedBy(user)
                        .build();

                mentorExperienceRepository.save(mentorExperience);
            }
        }

        // Save mentor tests/certificates with PENDING status
        if (request.getCertificates() != null && !request.getCertificates().isEmpty()) {
            for (SignUpMentorWithOtpRequest.Certificate certificate : request.getCertificates()) {
                List<String> scoreUrls = new ArrayList<>();

                if (certificate.getCertificatesFile() != null && !certificate.getCertificatesFile().isEmpty()) {
                    try {
                        String scoreUrl = uploadImageFile.uploadImage(certificate.getCertificatesFile());
                        scoreUrls.add(scoreUrl);
                        log.info("Certificate file uploaded successfully: {}", scoreUrl);
                    } catch (IOException e) {
                        log.error("Failed to upload certificate file for {}: {}", certificate.getCertificateName(), e.getMessage());
                        throw new AppException(ErrorCode.UNCATEGORIZED, "Failed to upload certificate file: " + e.getMessage());
                    }
                }

                MentorTest mentorTest = MentorTest.builder()
                        .user(user)
                        .testName(certificate.getCertificateName())
                        .score(certificate.getScore())
                        .scoreImage(String.join(",", scoreUrls))
                        .status(pendingStatus)
                        .createdBy(user)
                        .updatedBy(user)
                        .build();

                mentorTestRepository.save(mentorTest);
            }
        }

        // Save mentor countries
        if (request.getMentorCountries() != null && !request.getMentorCountries().isEmpty()) {
            Status approvedCountryStatus = statusRepository.findByCode("APPROVED")
                    .orElseThrow(() -> new IllegalArgumentException("Approved status not found"));

            for (SignUpMentorWithOtpRequest.MentorCountryRequest countryRequest : request.getMentorCountries()) {
                Country country = null;
                Status mentorCountryStatus = pendingStatus;

                if (countryRequest.getCountryName() != null && !countryRequest.getCountryName().isEmpty()) {
                    country = countryRepository.findByName(countryRequest.getCountryName())
                            .orElse(null);

                    if (country == null) {
                        String countryCode = countryRequest.getCountryName();
                        if (countryCode != null && !countryCode.isEmpty()) {
                            countryCode = countryCode
                                    .toUpperCase()
                                    .replaceAll("\\s+", "");
                        }

                        country = Country.builder()
                                .code(countryCode)
                                .name(countryRequest.getCountryName())
                                .description(countryRequest.getDescription())
                                .status(pendingStatus)
                                .createdBy(user)
                                .updatedBy(user)
                                .build();

                        country = countryRepository.save(country);
                    } else {
                        if ("APPROVED".equals(country.getStatus().getCode())) {
                            mentorCountryStatus = approvedCountryStatus;
                        }
                    }
                }

                if (country != null) {
                    MentorCountry mentorCountry = MentorCountry.builder()
                            .mentor(user)
                            .country(country)
                            .status(mentorCountryStatus)
                            .adminComment(countryRequest.getDescription())
                            .createdBy(user)
                            .updatedBy(user)
                            .build();

                    mentorCountryRepository.save(mentorCountry);
                }
            }
        }

        // Generate tokens
        var accessToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .build();
    }

    private User validateToken(String token) {
        var email = jwtService.extractUsername(token, RESET_TOKEN);
        var user = userService.getUserByEmail(email);
        if (!user.isEnabled()) {
            throw new AppException(UNCATEGORIZED);
        }
        return user;
    }
}

