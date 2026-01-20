package vn.fpt.se18.MentorLinking_BackEnd.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.service.PasswordResetService;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenCleanupScheduledService {

    private final PasswordResetService passwordResetService;

    /**
     * Dọn dẹp các token reset password hết hạn
     * Chạy mỗi ngày lúc 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupExpiredPasswordResetTokens() {
        log.info("🧹 Bắt đầu dọn dẹp các token reset password hết hạn");
        try {
            passwordResetService.cleanupExpiredTokens();
            log.info("✅ Hoàn thành dọn dẹp token reset password hết hạn");
        } catch (Exception e) {
            log.error("❌ Lỗi khi dọn dẹp token hết hạn: {}", e.getMessage(), e);
        }
    }

    /**
     * Dọn dẹp các token reset password hết hạn (chạy mỗi 6 giờ)
     * Backup cleanup job để đảm bảo token được dọn dẹp thường xuyên
     */
    @Scheduled(fixedRate = 6 * 60 * 60 * 1000) // 6 hours in milliseconds
    public void cleanupExpiredPasswordResetTokensRegularly() {
        log.debug("🧹 Dọn dẹp token reset password hết hạn (định kỳ)");
        try {
            passwordResetService.cleanupExpiredTokens();
        } catch (Exception e) {
            log.error("❌ Lỗi khi dọn dẹp token hết hạn (định kỳ): {}", e.getMessage());
        }
    }
}