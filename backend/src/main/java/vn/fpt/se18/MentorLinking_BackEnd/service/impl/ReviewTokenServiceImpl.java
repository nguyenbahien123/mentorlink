package vn.fpt.se18.MentorLinking_BackEnd.service.impl;

import vn.fpt.se18.MentorLinking_BackEnd.entity.ReviewToken;
import vn.fpt.se18.MentorLinking_BackEnd.repository.ReviewTokenRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.ReviewTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewTokenServiceImpl implements ReviewTokenService {

    private final ReviewTokenRepository reviewTokenRepository;

    @Override
    @Transactional
    public ReviewToken generateReviewToken(Long bookingId, String email, int expirationHours) {
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(expirationHours);
        return generateReviewTokenWithExpiration(bookingId, email, expiresAt);
    }

    @Override
    @Transactional
    public ReviewToken generateReviewTokenWithExpiration(Long bookingId, String email, LocalDateTime expiresAt) {
        try {
            // Xoá token cũ nếu có
            var oldToken = reviewTokenRepository.findByBookingIdAndIsUsedFalse(bookingId);
            if (oldToken.isPresent()) {
                reviewTokenRepository.delete(oldToken.get());
                log.debug("Deleted old unused token for booking {}", bookingId);
            }

            // Tạo token mới
            String tokenString = UUID.randomUUID().toString();

            ReviewToken token = ReviewToken.builder()
                    .token(tokenString)
                    .bookingId(bookingId)
                    .email(email)
                    .isUsed(false)
                    .expiresAt(expiresAt)
                    .build();

            ReviewToken saved = reviewTokenRepository.save(token);
            log.info("Generated review token for booking {} with expiration at {}", bookingId, expiresAt);
            return saved;

        } catch (Exception e) {
            log.error("Error generating review token for booking {}: {}", bookingId, e.getMessage(), e);
            throw new RuntimeException("Failed to generate review token", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewToken validateReviewToken(String token) {
        try {
            if (token == null) {
                log.warn("validateReviewToken called with null token");
                return null;
            }

            String trimmed = token.trim();

            // Try direct lookup first
            var reviewTokenOpt = reviewTokenRepository.findByToken(trimmed);

            // If not found, try URL-decoded variant (in case frontend double-encoded)
            if (reviewTokenOpt.isEmpty()) {
                try {
                    String urlDecoded = java.net.URLDecoder.decode(trimmed, java.nio.charset.StandardCharsets.UTF_8);
                    if (!urlDecoded.equals(trimmed)) {
                        reviewTokenOpt = reviewTokenRepository.findByToken(urlDecoded);
                        if (reviewTokenOpt.isPresent()) {
                            log.debug("Found token by URL-decoding: {} -> {}", trimmed, urlDecoded);
                        }
                    }
                } catch (Exception e) {
                    log.debug("URL decode attempt failed for token: {}", trimmed);
                }
            }

            // If not found, try stripping surrounding braces {token}
            if (reviewTokenOpt.isEmpty()) {
                if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
                    String stripped = trimmed.substring(1, trimmed.length() - 1);
                    reviewTokenOpt = reviewTokenRepository.findByToken(stripped);
                    if (reviewTokenOpt.isPresent()) {
                        log.debug("Found token by stripping braces: {} -> {}", trimmed, stripped);
                    }
                }
            }

            // Also try adding braces if initial lookup failed but DB stores with braces
            if (reviewTokenOpt.isEmpty()) {
                String withBraces = "{" + trimmed + "}";
                reviewTokenOpt = reviewTokenRepository.findByToken(withBraces);
                if (reviewTokenOpt.isPresent()) {
                    log.debug("Found token by adding braces: {} -> {}", trimmed, withBraces);
                }
            }

            if (reviewTokenOpt.isEmpty()) {
                log.warn("Review token not found (tried variants): {}", token);
                return null;
            }

            ReviewToken rt = reviewTokenOpt.get();

            log.debug("Review token record: token='{}' expiresAt='{}' isUsed='{}'", rt.getToken(), rt.getExpiresAt(), rt.getIsUsed());

            // Kiểm tra token hợp lệ (không expired, chưa dùng)
            if (!rt.isValid()) {
                if (rt.isExpired()) {
                    log.warn("Review token expired: stored expiresAt={}", rt.getExpiresAt());
                } else if (rt.getIsUsed()) {
                    log.warn("Review token already used: token={}", rt.getToken());
                }
                return null;
            }

            log.debug("Review token validated successfully: {}", rt.getToken());
            return rt;

        } catch (Exception e) {
            log.error("Error validating review token {}: {}", token, e.getMessage(), e);
            return null;
        }
    }

    @Override
    @Transactional
    public void markTokenAsUsed(String token) {
        try {
            var reviewToken = reviewTokenRepository.findByToken(token);
            if (reviewToken.isPresent()) {
                ReviewToken rt = reviewToken.get();
                rt.setIsUsed(true);
                reviewTokenRepository.save(rt);
                log.info("Marked review token as used: {}", token);
            }
        } catch (Exception e) {
            log.error("Error marking token as used {}: {}", token, e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void cleanupExpiredTokens() {
        try {
            LocalDateTime now = LocalDateTime.now();
            reviewTokenRepository.deleteByExpiresAtBefore(now);
            log.info("Cleaned up expired review tokens");
        } catch (Exception e) {
            log.error("Error cleaning up expired review tokens: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewToken findByBookingId(Long bookingId) {
        try {
            return reviewTokenRepository.findByBookingIdAndIsUsedFalse(bookingId).orElse(null);
        } catch (Exception e) {
            log.error("Error finding review token for booking {}: {}", bookingId, e.getMessage(), e);
            return null;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewToken findByToken(String token) {
        try {
            if (token == null) return null;
            return reviewTokenRepository.findByToken(token).orElse(null);
        } catch (Exception e) {
            log.error("Error finding review token by token {}: {}", token, e.getMessage(), e);
            return null;
        }
    }
}
