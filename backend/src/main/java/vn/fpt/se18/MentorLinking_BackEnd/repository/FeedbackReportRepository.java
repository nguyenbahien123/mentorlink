package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.FeedbackReport;

@Repository
public interface FeedbackReportRepository extends JpaRepository<FeedbackReport, Long> {

    @Query("SELECT f FROM FeedbackReport f " +
           "WHERE (:keySearch IS NULL OR :keySearch = '' OR " +
           "LOWER(f.reporter.fullname) LIKE LOWER(CONCAT('%', :keySearch, '%')) OR " +
           "LOWER(f.reporter.email) LIKE LOWER(CONCAT('%', :keySearch, '%')) OR " +
           "LOWER(f.content) LIKE LOWER(CONCAT('%', :keySearch, '%'))) " +
           "AND (:type IS NULL OR :type = '' OR f.type = :type) " +
           "AND (:statusCode IS NULL OR :statusCode = '' OR f.status.code = :statusCode)")
    Page<FeedbackReport> findAllWithCondition(
            @Param("keySearch") String keySearch,
            @Param("type") String type,
            @Param("statusCode") String statusCode,
            Pageable pageable
    );

    long countByStatusCode(String statusCode);

    @Query("SELECT COUNT(f) FROM FeedbackReport f WHERE f.status.code = 'HIGH'")
    long countHighPriority();
}
