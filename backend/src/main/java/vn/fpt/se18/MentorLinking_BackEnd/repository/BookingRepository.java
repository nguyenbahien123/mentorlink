package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Booking;
import vn.fpt.se18.MentorLinking_BackEnd.util.PaymentProcess;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Return list of schedule ids that have bookings among given schedule ids
    @Query("select b.schedule.id from Booking b where b.schedule.id in :ids")
    List<Long> findBookedScheduleIds(@Param("ids") List<Long> ids);

    // New: Return distinct schedule ids that have bookings with given payment process
    @Query("select distinct b.schedule.id from Booking b where b.schedule.id in :ids and b.paymentProcess = :process")
    List<Long> findScheduleIdsByIdsAndPaymentProcess(@Param("ids") List<Long> ids, @Param("process") PaymentProcess process);

    // Convenience derived method for single schedule
    boolean existsBySchedule_Id(Long scheduleId);

    // Find bookings by status id
    List<Booking> findByStatus_Id(Long statusId);

    Booking getBookingById(Long id);



    // Check if schedule has a COMPLETED payment booking
    boolean existsBySchedule_IdAndPaymentProcess(Long scheduleId, PaymentProcess paymentProcess);

    // Check if schedule has a COMPLETED booking excluding current booking (for race
    // condition check)
    boolean existsBySchedule_IdAndPaymentProcessAndIdNot(Long scheduleId, PaymentProcess paymentProcess,
            Long bookingId);

    // Find bookings for a given customer filtered by a list of payment processes
    List<Booking> findByCustomer_IdAndPaymentProcessIn(Long customerId, List<PaymentProcess> processes);

    @Query("select b from Booking b where b.mentor.email = :mentorEmail and b.paymentProcess = :process or b.paymentProcess = 'WAIT_REFUND'")
    List<Booking> findByMentorIdAndPaymentProcess(@Param("mentorEmail") String mentorEmail,
        @Param("process") PaymentProcess process);
    
    // Custom query for admin booking management with filters
    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.mentor m " +
           "LEFT JOIN FETCH b.customer c " +
           "LEFT JOIN FETCH b.schedule s " +
           "LEFT JOIN FETCH b.status st " +
           "LEFT JOIN FETCH b.paymentHistory ph " +
           "WHERE (:keySearch IS NULL OR " +
           "      LOWER(m.fullname) LIKE LOWER(CONCAT('%', :keySearch, '%')) OR " +
           "      LOWER(c.fullname) LIKE LOWER(CONCAT('%', :keySearch, '%')) OR " +
           "      LOWER(CAST(b.service AS string)) LIKE LOWER(CONCAT('%', :keySearch, '%'))) " +
           "AND (:statusCode IS NULL OR st.code = :statusCode) " +
           "AND (:paymentProcess IS NULL OR b.paymentProcess = :paymentProcess) " +
           "AND (:date IS NULL OR s.date = :date)")
    Page<Booking> findAllWithCondition(
            @Param("keySearch") String keySearch,
            @Param("statusCode") String statusCode,
            @Param("paymentProcess") PaymentProcess paymentProcess,
            @Param("date") LocalDate date,
            Pageable pageable
    );
    
    // Count by status code
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status.code = :statusCode")
    long countByStatusCode(@Param("statusCode") String statusCode);
    
    // Count by payment process
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.paymentProcess = :paymentProcess")
    long countByPaymentProcess(@Param("paymentProcess") PaymentProcess paymentProcess);
    
    // Calculate total revenue (PAID bookings only)
    @Query("SELECT COALESCE(SUM(s.price), 0.0) FROM Booking b " +
           "JOIN b.schedule s " +
           "WHERE b.paymentProcess = 'COMPLETED'")
    Double calculateTotalRevenue();
    
    // Calculate monthly revenue
    @Query("SELECT COALESCE(SUM(s.price), 0.0) FROM Booking b " +
           "JOIN b.schedule s " +
           "WHERE b.paymentProcess = 'COMPLETED' " +
           "AND MONTH(b.createdAt) = MONTH(CURRENT_DATE) " +
           "AND YEAR(b.createdAt) = YEAR(CURRENT_DATE)")
    Double calculateMonthlyRevenue();
    
    // Find bookings by schedule id
    List<Booking> findBySchedule_Id(Long scheduleId);
    
    // Find bookings by status code and payment process
    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.schedule s " +
           "LEFT JOIN FETCH s.timeSlots ts " +
           "WHERE b.status.code = :statusCode " +
           "AND b.paymentProcess = :paymentProcess")
    List<Booking> findByStatusCodeAndPaymentProcess(
            @Param("statusCode") String statusCode,
            @Param("paymentProcess") PaymentProcess paymentProcess
    );
}
