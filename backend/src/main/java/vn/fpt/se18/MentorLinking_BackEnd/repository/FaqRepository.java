package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.FAQ;
import vn.fpt.se18.MentorLinking_BackEnd.util.Urgency;

@Repository
public interface FaqRepository extends JpaRepository<FAQ, Long> {
    // Public queries
    Page<FAQ> findByIsPublishedTrue(Pageable pageable);
    
    // Admin queries
    Page<FAQ> findByIsPublishedFalse(Pageable pageable);
    Page<FAQ> findByQuestionContainingIgnoreCase(String keyword, Pageable pageable);
    Page<FAQ> findByQuestionContainingIgnoreCaseAndIsPublished(String keyword, Boolean published, Pageable pageable);
    Page<FAQ> findByQuestionContainingIgnoreCaseAndUrgency(String keyword, Urgency urgency, Pageable pageable);
    Page<FAQ> findByQuestionContainingIgnoreCaseAndIsPublishedAndUrgency(String keyword, Boolean published, Urgency urgency, Pageable pageable);
    Page<FAQ> findByIsPublishedAndUrgency(Boolean published, Urgency urgency, Pageable pageable);
    Page<FAQ> findByUrgency(Urgency urgency, Pageable pageable);
}

