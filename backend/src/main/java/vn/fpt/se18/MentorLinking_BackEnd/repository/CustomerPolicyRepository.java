package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.CustomerPolicy;

import java.util.List;

@Repository
public interface CustomerPolicyRepository extends JpaRepository<CustomerPolicy, Long> {

    /**
     * Find all active customer policies
     */
    List<CustomerPolicy> findByIsActiveTrue();

    /**
     * Find all inactive customer policies
     */
    List<CustomerPolicy> findByIsActiveFalse();

    /**
     * Find customer policies by title containing keyword (case insensitive)
     */
    @Query("SELECT cp FROM CustomerPolicy cp WHERE LOWER(cp.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<CustomerPolicy> findByTitleContainingIgnoreCase(@Param("keyword") String keyword);

    /**
     * Find active customer policies by title containing keyword
     */
    @Query("SELECT cp FROM CustomerPolicy cp WHERE cp.isActive = true AND LOWER(cp.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<CustomerPolicy> findActiveByTitleContainingIgnoreCase(@Param("keyword") String keyword);
}
