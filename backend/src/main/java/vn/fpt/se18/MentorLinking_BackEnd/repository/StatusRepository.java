package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;

import java.util.Optional;

public interface StatusRepository extends JpaRepository<Status, Long> {
    Optional<Status> findByCode(String active);

    Optional<Status> findByName(String name);
}
