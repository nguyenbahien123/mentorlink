package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Policy;
import vn.fpt.se18.MentorLinking_BackEnd.enums.PolicyType;

import java.util.List;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {

    Page<Policy> findByType(PolicyType type, Pageable pageable);

    @Query("SELECT p FROM Policy p WHERE p.type = :type AND LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Policy> findByTypeAndTitleContainingIgnoreCase(@Param("type") PolicyType type, @Param("keyword") String keyword, Pageable pageable);

    long countByType(PolicyType type);

    long countByTypeAndIsActiveTrue(PolicyType type);

    List<Policy> findByTypeAndIsActiveTrue(PolicyType type);
}