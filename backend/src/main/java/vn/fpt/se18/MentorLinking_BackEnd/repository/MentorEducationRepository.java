package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorEducation;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorEducationRepository extends JpaRepository<MentorEducation, Long> {

    @Query("SELECT me FROM MentorEducation me JOIN FETCH me.user u JOIN FETCH me.status s WHERE u.id = :mentorId")
    List<MentorEducation> findByUserId(@Param("mentorId") Long mentorId);

    @Query("SELECT me FROM MentorEducation me JOIN FETCH me.user u JOIN FETCH me.status s WHERE u.id = :mentorId ORDER BY me.createdAt DESC")
    Page<MentorEducation> findByUserIdPaginated(@Param("mentorId") Long mentorId, Pageable pageable);

    @Query("SELECT me FROM MentorEducation me JOIN FETCH me.user u JOIN FETCH me.status s WHERE me.id = :educationId AND s.name = 'APPROVED'")
    Optional<MentorEducation> findByIdWithRelationships(@Param("educationId") Long educationId);

    @Query("SELECT me FROM MentorEducation me JOIN FETCH me.user u JOIN FETCH me.status s WHERE u.id = :mentorId AND s.code = :statusCode")
    List<MentorEducation> findByUserIdAndStatusCode(@Param("mentorId") Long mentorId, @Param("statusCode") String statusCode);

    @Query("SELECT me FROM MentorEducation me JOIN FETCH me.user u JOIN FETCH me.status s WHERE s.code = :statusCode")
    List<MentorEducation> findByStatusCode(@Param("statusCode") String statusCode);
}
