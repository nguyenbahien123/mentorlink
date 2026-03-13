package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Token;

import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Integer> {

    Optional<Token> findByUsername(String username);

    @Modifying
    @Transactional
    @Query("DELETE FROM Token t WHERE t.updatedAt < :threshold")
    int deleteByUpdatedAtBefore(@Param("threshold") java.time.LocalDateTime threshold);

    long countByUpdatedAtBefore(java.time.LocalDateTime threshold);
}
