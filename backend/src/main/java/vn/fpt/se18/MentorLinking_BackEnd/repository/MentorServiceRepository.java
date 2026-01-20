package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorService;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorServiceResponse;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorServiceRepository extends JpaRepository<MentorService, Long> {

    /**
     * Find all services by mentor id and convert to DTO
     */
    @Query("SELECT new vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorServiceResponse(" +
            "ms.id, ms.serviceName, ms.description, s.name, s.code, " +
            "u.id, u.fullname, ms.createdAt, ms.updatedAt) " +
            "FROM MentorService ms " +
            "JOIN ms.user u " +
            "JOIN ms.status s " +
            "WHERE u.id = :mentorId")
    List<MentorServiceResponse> findByMentorId(@Param("mentorId") Long mentorId);

    /**
     * Find services by mentor id paginated with DTO
     */
    @Query("SELECT new vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorServiceResponse(" +
            "ms.id, ms.serviceName, ms.description, s.name, s.code, " +
            "u.id, u.fullname, ms.createdAt, ms.updatedAt) " +
            "FROM MentorService ms " +
            "JOIN ms.user u " +
            "JOIN ms.status s " +
            "WHERE u.id = :mentorId " +
            "ORDER BY ms.createdAt DESC")
    Page<MentorServiceResponse> findByMentorIdPaginated(@Param("mentorId") Long mentorId, Pageable pageable);

    /**
     * Find service by id with relationships
     */
    @Query("SELECT ms FROM MentorService ms " +
            "JOIN FETCH ms.user u " +
            "JOIN FETCH ms.status s " +
            "WHERE ms.id = :serviceId and ms.status.name = 'APPROVED'")
    Optional<MentorService> findByIdWithRelationships(@Param("serviceId") Long serviceId);

    /**
     * Find services by status
     */
    @Query("SELECT ms FROM MentorService ms " +
            "JOIN FETCH ms.user u " +
            "JOIN FETCH ms.status s " +
            "WHERE s.code = :statusCode")
    List<MentorService> findByStatusCode(@Param("statusCode") String statusCode);

    /**
     * Find services by mentor id and status
     */
    @Query("SELECT ms FROM MentorService ms " +
            "JOIN FETCH ms.user u " +
            "JOIN FETCH ms.status s " +
            "WHERE u.id = :mentorId AND s.code = :statusCode")
    List<MentorService> findByMentorIdAndStatusCode(@Param("mentorId") Long mentorId, @Param("statusCode") String statusCode);

    /**
     * Search services by keyword and status
     */
    @Query("SELECT ms FROM MentorService ms " +
            "JOIN FETCH ms.user u " +
            "JOIN FETCH ms.status s " +
            "WHERE s.code = :statusCode " +
            "AND (LOWER(ms.serviceName) LIKE :keyword OR LOWER(ms.description) LIKE :keyword " +
            "OR LOWER(u.fullname) LIKE :keyword)")
    Page<MentorService> searchByKeywordAndStatus(@Param("keyword") String keyword,
                                                  @Param("statusCode") String statusCode,
                                                  Pageable pageable);
}
