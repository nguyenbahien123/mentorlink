package vn.fpt.se18.MentorLinking_BackEnd.scheduler;

import vn.fpt.se18.MentorLinking_BackEnd.service.ReviewTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Service để tự động xoá các review token hết hạn
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewTokenCleanupScheduledService {

    private final ReviewTokenService reviewTokenService;

    /**
     * Chạy mỗi giờ để xoá các token đã hết hạn
     * Cron: 0 0 * * * * (mỗi giờ)
     */
    @Scheduled(cron = "0 0 * * * *")
    public void cleanupExpiredTokens() {
        try {
            log.info("Starting cleanup of expired review tokens...");
            reviewTokenService.cleanupExpiredTokens();
            log.info("Cleanup of expired review tokens completed successfully");
        } catch (Exception e) {
            log.error("Error during review token cleanup: {}", e.getMessage(), e);
        }
    }
}
