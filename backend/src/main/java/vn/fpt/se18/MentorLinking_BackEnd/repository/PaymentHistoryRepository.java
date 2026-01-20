package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.fpt.se18.MentorLinking_BackEnd.entity.PaymentHistory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory, Long> {
    Optional<PaymentHistory> findByTransactionCode(String transactionCode);

    Optional<PaymentHistory> findByBookingId(Long bookingId);
    
    // Custom query for admin payment management with filters
    @Query("SELECT ph FROM PaymentHistory ph " +
           "LEFT JOIN FETCH ph.booking b " +
           "LEFT JOIN FETCH b.mentor m " +
           "LEFT JOIN FETCH b.customer c " +
           "LEFT JOIN FETCH b.schedule s " +
           "LEFT JOIN FETCH ph.status st " +
           "WHERE (:keySearch IS NULL OR " +
           "      LOWER(ph.transactionCode) LIKE LOWER(CONCAT('%', :keySearch, '%')) OR " +
           "      LOWER(m.fullname) LIKE LOWER(CONCAT('%', :keySearch, '%')) OR " +
           "      LOWER(c.fullname) LIKE LOWER(CONCAT('%', :keySearch, '%'))) " +
           "AND (:statusCode IS NULL OR st.code = :statusCode) " +
           "AND (:paymentMethod IS NULL OR ph.paymentMethod = :paymentMethod) " +
           "AND (:dateFrom IS NULL OR ph.createdAt >= :dateFrom) " +
           "AND (:dateTo IS NULL OR ph.createdAt <= :dateTo)")
    Page<PaymentHistory> findAllWithCondition(
            @Param("keySearch") String keySearch,
            @Param("statusCode") String statusCode,
            @Param("paymentMethod") String paymentMethod,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable
    );
    
    // Count by status code
    @Query("SELECT COUNT(ph) FROM PaymentHistory ph WHERE ph.status.code = :statusCode")
    long countByStatusCode(@Param("statusCode") String statusCode);
    
    // Calculate total revenue (COMPLETED payments only)
    @Query("SELECT COALESCE(SUM(ph.amount), 0) FROM PaymentHistory ph " +
           "WHERE ph.status.code = 'COMPLETED'")
    BigDecimal calculateTotalRevenue();
    
    // Calculate total commission (assuming 10% commission)
    @Query("SELECT COALESCE(SUM(ph.amount * 0.1), 0) FROM PaymentHistory ph " +
           "WHERE ph.status.code = 'COMPLETED'")
    BigDecimal calculateTotalCommission();
    
    // Calculate total refunded amount
    @Query("SELECT COALESCE(SUM(ph.amount), 0) FROM PaymentHistory ph " +
           "WHERE ph.status.code = 'REFUNDED'")
    BigDecimal calculateTotalRefunded();
    
    // Calculate monthly revenue
    @Query("SELECT COALESCE(SUM(ph.amount), 0) FROM PaymentHistory ph " +
           "WHERE ph.status.code = 'COMPLETED' " +
           "AND MONTH(ph.createdAt) = MONTH(CURRENT_DATE) " +
           "AND YEAR(ph.createdAt) = YEAR(CURRENT_DATE)")
    BigDecimal calculateMonthlyRevenue();

    // Calculate total earned amount for a specific mentor (COMPLETED bookings only)
    @Query("SELECT COALESCE(SUM(ph.amount), 0) FROM PaymentHistory ph " +
           "WHERE ph.booking.mentor.id = :mentorId " +
           "AND ph.booking.paymentProcess = 'COMPLETED'")
    BigDecimal calculateMentorEarnings(@Param("mentorId") Long mentorId);
}
