// src/main/java/vn/fpt/se18/MentorLinking_BackEnd/repository/MentorAdRepository.java
package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorAd;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.enums.BannerStatus;

import java.util.List;

@Repository
public interface MentorAdRepository extends JpaRepository<MentorAd, Long> {

    Page<MentorAd> findByMentor(User mentor, Pageable pageable);

    Page<MentorAd> findByStatus(BannerStatus status, Pageable pageable);

    List<MentorAd> findByStatusAndIsPublishedTrueOrderByPositionAsc(BannerStatus status);

    long countByStatus(BannerStatus status);
}