package vn.fpt.se18.MentorLinking_BackEnd.repository;

import vn.fpt.se18.MentorLinking_BackEnd.entity.ReviewToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewTokenRepository extends JpaRepository<ReviewToken, Long> {

    /**
     * Tìm token theo string token
     */
    Optional<ReviewToken> findByToken(String token);

    /**
     * Tìm token theo booking ID
     */
    Optional<ReviewToken> findByBookingId(Long bookingId);

    /**
     * Tìm các token hết hạn
     */
    List<ReviewToken> findByExpiresAtBefore(LocalDateTime now);

    /**
     * Tìm các token chưa dùng của booking
     */
    Optional<ReviewToken> findByBookingIdAndIsUsedFalse(Long bookingId);

    /**
     * Xóa các token hết hạn
     */
    void deleteByExpiresAtBefore(LocalDateTime now);
}
