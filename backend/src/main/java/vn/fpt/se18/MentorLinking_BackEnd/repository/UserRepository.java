package vn.fpt.se18.MentorLinking_BackEnd.repository;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Role;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.email = :email")
    Optional<User> findByEmailWithRole(@Param("email") String email);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.username = ?1")
    Optional<User> findByUsername(String username);

    @Query(value = "select r.name from Role r inner join UserHasRole ur on r.id = ur.user.id where ur.id= :userId")
    List<String> findAllRolesByUserId(Long userId);

    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.username = :username")
    Optional<User> findByUsernameWithRole(@Param("username") String username);

    @Query("SELECT u FROM User u WHERE " +
            "(:keySearch IS NULL OR LOWER(u.fullname) LIKE LOWER(CONCAT('%', :keySearch, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keySearch, '%')) " +
            "OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keySearch, '%')) ) " +
            "AND (:role IS NULL OR u.role.id = :role) " +
            "AND (:status IS NULL OR u.status.id = :status)")
    Page<User> findAllWithCondition(String keySearch, Long role, Long status, Pageable pageable);

    long countByStatus(Status status);

    long countByRole(Role role);
}