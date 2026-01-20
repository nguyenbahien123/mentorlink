package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.entity.PasswordResetToken;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByEmailAndUsedFalse(String email);

    @Query("SELECT p FROM PasswordResetToken p WHERE p.email = :email AND p.used = false AND p.expiryDate > :now ORDER BY p.createdAt DESC")
    Optional<PasswordResetToken> findValidTokenByEmail(@Param("email") String email, @Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    @Query("UPDATE PasswordResetToken p SET p.used = true WHERE p.email = :email AND p.used = false")
    void markTokensAsUsedByEmail(@Param("email") String email);

    @Modifying
    @Transactional
    @Query("DELETE FROM PasswordResetToken p WHERE p.expiryDate < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(p) FROM PasswordResetToken p WHERE p.email = :email AND p.createdAt > :since")
    int countRecentTokensByEmail(@Param("email") String email, @Param("since") LocalDateTime since);

    boolean existsByTokenAndUsedFalse(String token);
}