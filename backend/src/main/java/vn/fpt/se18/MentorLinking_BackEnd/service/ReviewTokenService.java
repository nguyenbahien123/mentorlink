package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.entity.ReviewToken;
import java.time.LocalDateTime;

public interface ReviewTokenService {

    /**
     * Tạo token review mới cho booking
     * @param bookingId ID của booking
     * @param email Email của người dùng
     * @param expirationHours Số giờ token hợp lệ
     * @return ReviewToken vừa tạo
     */
    ReviewToken generateReviewToken(Long bookingId, String email, int expirationHours);

    /**
     * Tạo token review với custom expiration time
     * @param bookingId ID của booking
     * @param email Email của người dùng
     * @param expiresAt LocalDateTime chính xác khi token hết hạn
     * @return ReviewToken vừa tạo
     */
    ReviewToken generateReviewTokenWithExpiration(Long bookingId, String email, LocalDateTime expiresAt);

    /**
     * Validate token review
     * @param token Token string cần validate
     * @return ReviewToken nếu hợp lệ, null nếu không
     */
    ReviewToken validateReviewToken(String token);

    /**
     * Đánh dấu token đã sử dụng
     * @param token Token string
     */
    void markTokenAsUsed(String token);

    /**
     * Xóa các token hết hạn
     */
    void cleanupExpiredTokens();

    /**
     * Tìm token theo booking ID
     */
    ReviewToken findByBookingId(Long bookingId);

    /**
     * Trả về ReviewToken thô theo token string (không kiểm tra hợp lệ/expiry)
     */
    ReviewToken findByToken(String token);
}
