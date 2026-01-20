package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorTest;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorTestRepository extends JpaRepository<MentorTest, Long> {

    @Query("SELECT mt FROM MentorTest mt JOIN FETCH mt.user u JOIN FETCH mt.status s WHERE u.id = :mentorId")
    List<MentorTest> findByUserId(@Param("mentorId") Long mentorId);

    @Query("SELECT mt FROM MentorTest mt JOIN FETCH mt.user u JOIN FETCH mt.status s WHERE u.id = :mentorId ORDER BY mt.createdAt DESC")
    Page<MentorTest> findByUserIdPaginated(@Param("mentorId") Long mentorId, Pageable pageable);

    @Query("SELECT mt FROM MentorTest mt JOIN FETCH mt.user u JOIN FETCH mt.status s WHERE mt.id = :testId AND s.name = 'APPROVED'")
    Optional<MentorTest> findByIdWithRelationships(@Param("testId") Long testId);

    @Query("SELECT mt FROM MentorTest mt JOIN FETCH mt.user u JOIN FETCH mt.status s WHERE u.id = :mentorId AND s.code = :statusCode")
    List<MentorTest> findByUserIdAndStatusCode(@Param("mentorId") Long mentorId, @Param("statusCode") String statusCode);

    @Query("SELECT mt FROM MentorTest mt JOIN FETCH mt.user u JOIN FETCH mt.status s WHERE s.code = :statusCode")
    List<MentorTest> findByStatusCode(@Param("statusCode") String statusCode);
}
