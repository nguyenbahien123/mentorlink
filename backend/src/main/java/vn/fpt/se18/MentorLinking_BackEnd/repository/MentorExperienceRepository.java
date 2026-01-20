package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorExperience;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorExperienceRepository extends JpaRepository<MentorExperience, Long> {

    @Query("SELECT me FROM MentorExperience me JOIN FETCH me.user u JOIN FETCH me.status s WHERE u.id = :mentorId")
    List<MentorExperience> findByUserId(@Param("mentorId") Long mentorId);

    @Query("SELECT me FROM MentorExperience me JOIN FETCH me.user u JOIN FETCH me.status s WHERE u.id = :mentorId ORDER BY me.createdAt DESC")
    Page<MentorExperience> findByUserIdPaginated(@Param("mentorId") Long mentorId, Pageable pageable);

    @Query("SELECT me FROM MentorExperience me JOIN FETCH me.user u JOIN FETCH me.status s WHERE me.id = :experienceId")
    Optional<MentorExperience> findByIdWithRelationships(@Param("experienceId") Long experienceId);

    @Query("SELECT me FROM MentorExperience me JOIN FETCH me.user u JOIN FETCH me.status s WHERE u.id = :mentorId AND s.code = :statusCode")
    List<MentorExperience> findByUserIdAndStatusCode(@Param("mentorId") Long mentorId, @Param("statusCode") String statusCode);

    @Query("SELECT me FROM MentorExperience me JOIN FETCH me.user u JOIN FETCH me.status s WHERE s.code = :statusCode")
    List<MentorExperience> findByStatusCode(@Param("statusCode") String statusCode);
}
