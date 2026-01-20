package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.OtpVerification;
import vn.fpt.se18.MentorLinking_BackEnd.util.OtpStatus;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findByEmailAndOtpCodeAndStatus(String email, String otpCode, OtpStatus status);

    Optional<OtpVerification> findByEmailAndStatus(String email, OtpStatus status);

    @Modifying
    @Query("UPDATE OtpVerification o SET o.status = :status WHERE o.email = :email AND o.status = :currentStatus")
    void updateStatusByEmailAndCurrentStatus(@Param("email") String email,
                                           @Param("status") OtpStatus status,
                                           @Param("currentStatus") OtpStatus currentStatus);

    @Query("SELECT COUNT(o) > 0 FROM OtpVerification o WHERE o.email = :email AND o.status = :status AND o.expiresAt > :now")
    boolean existsActiveOtpByEmail(@Param("email") String email,
                                  @Param("status") OtpStatus status,
                                  @Param("now") LocalDateTime now);
}
