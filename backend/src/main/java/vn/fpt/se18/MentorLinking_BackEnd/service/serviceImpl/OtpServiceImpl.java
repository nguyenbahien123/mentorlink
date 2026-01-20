package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.entity.OtpVerification;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.OtpVerificationRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.EmailService;
import vn.fpt.se18.MentorLinking_BackEnd.service.OtpService;
import vn.fpt.se18.MentorLinking_BackEnd.util.OtpStatus;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpServiceImpl implements OtpService {

    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;
    private final UserRepository userRepository; // Thêm UserRepository để kiểm tra email

    @Override
    @Transactional
    public boolean generateAndSendOtp(String email) {
        try {
            // ✅ Kiểm tra email đã tồn tại trong hệ thống chưa
            if (userRepository.findByEmail(email).isPresent()) {
                log.warn("❌ Email đã được đăng ký trong hệ thống: {}", email);
                throw new AppException(ErrorCode.UNCATEGORIZED, "Email đã được sử dụng để đăng ký tài khoản");
            }

            // Hủy tất cả OTP đang hoạt động của email này
            cancelActiveOtp(email);

            // Tạo OTP 6 chữ số ngẫu nhiên
            String otpCode = generateRandomOtp();

            // Lưu OTP vào database
            OtpVerification otp = OtpVerification.builder()
                    .email(email)
                    .otpCode(otpCode)
                    .build();

            otpRepository.save(otp);

            // Gửi OTP qua email
            String subject = "Mã xác thực OTP - MentorLink";
            emailService.sendOtp(email, subject, otpCode);

            log.info("✅ OTP đã được tạo và gửi thành công đến email: {}", email);
            return true;

        } catch (AppException e) {
            // Re-throw AppException để giữ nguyên error message
            throw e;
        } catch (Exception e) {
            log.error("❌ Lỗi khi tạo và gửi OTP: {}", e.getMessage());
            return false;
        }
    }

    @Override
    @Transactional
    public boolean verifyOtp(String email, String otpCode) {
        try {
            Optional<OtpVerification> otpOpt = otpRepository
                    .findByEmailAndOtpCodeAndStatus(email, otpCode, OtpStatus.ACTIVE);

            if (otpOpt.isEmpty()) {
                log.warn(" OTP không tồn tại hoặc đã được sử dụng cho email: {}", email);
                return false;
            }

            OtpVerification otp = otpOpt.get();

            // Kiểm tra OTP có hết hạn không
            if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
                // Cập nhật trạng thái thành EXPIRED
                otp.setStatus(OtpStatus.EXPIRED);
                otpRepository.save(otp);
                log.warn(" OTP đã hết hạn cho email: {}", email);
                return false;
            }

            // Đánh dấu OTP đã được sử dụng
            otp.setStatus(OtpStatus.USED);
            otpRepository.save(otp);

            log.info(" OTP xác thực thành công cho email: {}", email);
            return true;

        } catch (Exception e) {
            log.error(" Lỗi khi xác thực OTP: {}", e.getMessage());
            return false;
        }
    }

    @Override
    @Transactional
    public boolean resendOtp(String email) {
        // Hủy OTP cũ và tạo OTP mới
        return generateAndSendOtp(email);
    }

    @Override
    @Transactional
    public void cancelActiveOtp(String email) {
        try {
            otpRepository.updateStatusByEmailAndCurrentStatus(email, OtpStatus.CANCELLED, OtpStatus.ACTIVE);
            log.info(" Đã hủy tất cả OTP đang hoạt động cho email: {}", email);
        } catch (Exception e) {
            log.error(" Lỗi khi hủy OTP: {}", e.getMessage());
        }
    }

    /**
     * Tạo mã OTP 6 chữ số ngẫu nhiên
     */
    private String generateRandomOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // Tạo số từ 100000 đến 999999
        return String.valueOf(otp);
    }

    /**
     * Tạo nội dung email cho OTP
     */
    private String buildOtpEmailContent(String otpCode) {
        return String.format(
            "Chào bạn,\n\n" +
            "Mã xác thực OTP của bạn là: %s\n\n" +
            "Mã này sẽ hết hạn sau 2 phút.\n" +
            "Vui lòng không chia sẻ mã này với bất kỳ ai.\n\n" +
            "Trân trọng,\n" +
            "Đội ngũ MentorLink",
            otpCode
        );
    }
}
