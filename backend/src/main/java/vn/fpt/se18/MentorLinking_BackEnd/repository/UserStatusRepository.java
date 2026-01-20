package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;

import java.util.Optional;

@Repository
public interface UserStatusRepository extends JpaRepository<Status, Long> {
    Optional<Status> findByName(String name);
}
