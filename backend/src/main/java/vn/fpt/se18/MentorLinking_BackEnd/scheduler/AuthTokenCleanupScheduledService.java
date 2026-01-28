package vn.fpt.se18.MentorLinking_BackEnd.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.repository.TokenRepository;

import java.time.LocalDateTime;
import jakarta.annotation.PostConstruct;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthTokenCleanupScheduledService {

    private final TokenRepository tokenRepository;

    // retention days for auth tokens (default 30 days)
    @Value("${scheduler.authTokenRetentionDays:30}")
    private int authTokenRetentionDays;

    @Value("${scheduler.runAuthCleanupOnStartup:false}")
    private boolean runAuthCleanupOnStartup;

    /**
     * Run once a day at 03:00 AM to cleanup old auth tokens
     */
    @Scheduled(cron = "${scheduler.authTokenCleanupCron:0 0 3 * * ?}")
    @Transactional
    public void cleanupOldAuthTokens() {
        try {
            LocalDateTime threshold = LocalDateTime.now().minusDays(Math.max(0, authTokenRetentionDays));
            log.info("Auth token cleanup: computing threshold={} (retentionDays={})", threshold, authTokenRetentionDays);

            long candidates = tokenRepository.countByUpdatedAtBefore(threshold);
            log.info("Auth token cleanup: {} token(s) found older than {}", candidates, threshold);

            if (candidates > 0) {
                int deleted = tokenRepository.deleteByUpdatedAtBefore(threshold);
                log.info("Auth token cleanup: deleted {} token(s)", deleted);
            } else {
                log.info("Auth token cleanup: no tokens to delete");
            }

            log.info("Auth token cleanup completed");
        } catch (Exception e) {
            log.error("Error during auth token cleanup: {}", e.getMessage(), e);
        }
    }

    @PostConstruct
    public void runOnStartup() {
        if (runAuthCleanupOnStartup) {
            log.info("runAuthCleanupOnStartup=true => executing auth token cleanup at startup");
            cleanupOldAuthTokens();
        }
    }
}
