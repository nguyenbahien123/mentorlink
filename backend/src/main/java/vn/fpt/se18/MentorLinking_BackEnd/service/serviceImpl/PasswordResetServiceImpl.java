package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.PasswordResetToken;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.PasswordResetTokenRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.EmailService;
import vn.fpt.se18.MentorLinking_BackEnd.service.PasswordResetService;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url:http://localhost:5173}")  
    private String frontendUrl;

    // Token hết hạn sau 15 phút
    private static final int TOKEN_EXPIRY_MINUTES = 15;
    
    // Giới hạn số lần gửi email reset trong 1 giờ
    private static final int MAX_RESET_ATTEMPTS_PER_HOUR = 3;

    @Override
    @Transactional
    public BaseResponse<String> sendResetPasswordEmail(String email) {
        try {
            // Kiểm tra email có tồn tại không
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return BaseResponse.<String>builder()
                        .respCode("1")
                        .description("Email không tồn tại trong hệ thống")
                        .data("Vui lòng kiểm tra lại email")
                        .build();
            }

            User user = userOpt.get();

            // Kiểm tra số lần gửi email reset trong 1 giờ để tránh spam
            LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
            int recentAttempts = passwordResetTokenRepository.countRecentTokensByEmail(email, oneHourAgo);
            
            if (recentAttempts >= MAX_RESET_ATTEMPTS_PER_HOUR) {
                return BaseResponse.<String>builder()
                        .respCode("1")
                        .description("Quá nhiều yêu cầu reset password")
                        .data("Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ.")
                        .build();
            }

            // Vô hiệu hóa tất cả token cũ của email này
            passwordResetTokenRepository.markTokensAsUsedByEmail(email);

            // Tạo token mới
            String token = UUID.randomUUID().toString();
            LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES);

            PasswordResetToken passwordResetToken = PasswordResetToken.builder()
                    .email(email)
                    .token(token)
                    .expiryDate(expiryDate)
                    .used(false)
                    .user(user)
                    .build();

            passwordResetTokenRepository.save(passwordResetToken);

            // Tạo link reset password
            String resetLink = frontendUrl + "/reset-password?token=" + token;

            // Gửi email
            String subject = "Yêu cầu đặt lại mật khẩu - MentorLink";
            emailService.sendPasswordResetEmail(email, subject, user.getFullname(), resetLink, TOKEN_EXPIRY_MINUTES);

            log.info("✅ Email reset password đã được gửi thành công đến: {}", email);

            return BaseResponse.<String>builder()
                    .respCode("0")
                    .description("Email reset password đã được gửi thành công")
                    .data("Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư.")
                    .build();

        } catch (Exception e) {
            log.error("❌ Lỗi khi gửi email reset password: {}", e.getMessage());
            return BaseResponse.<String>builder()
                    .respCode("1")
                    .description("Gửi email thất bại")
                    .data("Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.")
                    .build();
        }
    }

    @Override
    public BaseResponse<String> validateResetToken(String token) {
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(token);
        
        if (tokenOpt.isEmpty()) {
            return BaseResponse.<String>builder()
                    .respCode("1")
                    .description("Token không hợp lệ")
                    .data("Link đặt lại mật khẩu không hợp lệ")
                    .build();
        }

        PasswordResetToken resetToken = tokenOpt.get();

        if (!resetToken.isValid()) {
            String message = resetToken.isExpired() ? 
                "Link đặt lại mật khẩu đã hết hạn" : 
                "Link đặt lại mật khẩu đã được sử dụng";
                
            return BaseResponse.<String>builder()
                    .respCode("1")
                    .description("Token không hợp lệ")
                    .data(message)
                    .build();
        }

        return BaseResponse.<String>builder()
                .respCode("0")
                .description("Token hợp lệ")
                .data("Bạn có thể đặt lại mật khẩu")
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<String> resetPassword(String token, String newPassword) {
        try {
            // Validate token
            BaseResponse<String> tokenValidation = validateResetToken(token);
            if (!"0".equals(tokenValidation.getRespCode())) {
                return tokenValidation;
            }

            // Lấy token từ database
            PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token).orElseThrow();
            User user = resetToken.getUser();

            // Mã hóa mật khẩu mới
            String encodedPassword = passwordEncoder.encode(newPassword);
            user.setPassword(encodedPassword);
            userRepository.save(user);

            // Đánh dấu token đã được sử dụng
            resetToken.setUsed(true);
            passwordResetTokenRepository.save(resetToken);

            log.info("✅ Mật khẩu đã được reset thành công cho user: {}", user.getEmail());

            return BaseResponse.<String>builder()
                    .respCode("0")
                    .description("Đặt lại mật khẩu thành công")
                    .data("Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.")
                    .build();

        } catch (Exception e) {
            log.error("❌ Lỗi khi reset password: {}", e.getMessage());
            return BaseResponse.<String>builder()
                    .respCode("1")
                    .description("Đặt lại mật khẩu thất bại")
                    .data("Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.")
                    .build();
        }
    }

    @Override
    public boolean isEmailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Override
    @Transactional
    public void cleanupExpiredTokens() {
        try {
            passwordResetTokenRepository.deleteExpiredTokens(LocalDateTime.now());
            log.info("✅ Đã dọn dẹp các token reset password hết hạn");
        } catch (Exception e) {
            log.error("❌ Lỗi khi dọn dẹp token hết hạn: {}", e.getMessage());
        }
    }
}