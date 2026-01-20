package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.HighestDegree;

import java.util.Optional;

public interface HighestDegreeRepository extends JpaRepository<HighestDegree, Long> {
    Optional<HighestDegree> findByName(String levelOfEducation);
}
