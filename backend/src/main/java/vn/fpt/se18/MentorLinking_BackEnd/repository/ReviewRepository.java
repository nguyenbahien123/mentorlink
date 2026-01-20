package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Review;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r " +
           "LEFT JOIN r.booking b " +
           "LEFT JOIN b.customer c " +
           "LEFT JOIN b.mentor m " +
           "WHERE (:keySearch IS NULL OR :keySearch = '' OR " +
           "LOWER(c.fullname) LIKE LOWER(CONCAT('%', :keySearch, '%')) OR " +
           "LOWER(m.fullname) LIKE LOWER(CONCAT('%', :keySearch, '%')) OR " +
           "LOWER(r.comment) LIKE LOWER(CONCAT('%', :keySearch, '%'))) " +
           "AND (:rating IS NULL OR r.rating = :rating) " +
           "AND (:status IS NULL OR :status = '' OR " +
           "(:status = 'published' AND r.isPublished = true) OR " +
           "(:status = 'pending' AND r.isPublished = false)) " +
           "AND (:dateFrom IS NULL OR r.createdAt >= :dateFrom) " +
           "AND (:dateTo IS NULL OR r.createdAt <= :dateTo)")
    Page<Review> findAllWithCondition(
            @Param("keySearch") String keySearch,
            @Param("rating") Integer rating,
            @Param("status") String status,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable
    );

    Optional<Review> findByBookingId(Long bookingId);

    // Statistics queries
    long countByIsPublished(Boolean isPublished);

    long countByRating(Integer rating);

    @Query("SELECT AVG(r.rating) FROM Review r")
    Double calculateAverageRating();
}
