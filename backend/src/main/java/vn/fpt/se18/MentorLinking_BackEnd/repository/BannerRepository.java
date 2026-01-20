package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Banner;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findTop5ByStatus_NameAndIsPublishedOrderByPositionAsc(String statusName, Boolean isPublished);
    
    // Admin queries
    @Query("SELECT b FROM Banner b " +
           "LEFT JOIN b.createdBy creator " +
           "LEFT JOIN b.status status " +
           "WHERE (:keySearch IS NULL OR :keySearch = '' OR " +
           "      LOWER(b.title) LIKE LOWER(CONCAT('%', :keySearch, '%')) OR " +
           "      LOWER(creator.fullname) LIKE LOWER(CONCAT('%', :keySearch, '%'))) " +
           "AND (:status IS NULL OR :status = '' OR status.name = :status) " +
           "AND (:isPublished IS NULL OR b.isPublished = :isPublished) " +
           "AND (:dateFrom IS NULL OR b.startDate >= :dateFrom) " +
           "AND (:dateTo IS NULL OR b.endDate <= :dateTo)")
    Page<Banner> findAllWithCondition(
            @Param("keySearch") String keySearch,
            @Param("status") String status,
            @Param("isPublished") Boolean isPublished,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            Pageable pageable
    );
    
    // Statistics queries
    @Query("SELECT COUNT(b) FROM Banner b WHERE b.status.name = :statusName")
    Integer countByStatusName(@Param("statusName") String statusName);
    
    @Query("SELECT COUNT(b) FROM Banner b WHERE b.isPublished = :isPublished")
    Integer countByIsPublished(@Param("isPublished") Boolean isPublished);
    
    @Query("SELECT COALESCE(SUM(b.viewCount), 0) FROM Banner b")
    Long sumViewCount();
    
    @Query("SELECT COALESCE(SUM(b.clickCount), 0) FROM Banner b")
    Long sumClickCount();
}
