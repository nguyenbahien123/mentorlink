package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Role;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);

    Optional<Role> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByName(String name);

    @Query("SELECT COUNT(DISTINCT uhr.user) FROM UserHasRole uhr WHERE uhr.role.code = :roleCode")
    Long countUsersByRoleCode(@Param("roleCode") String roleCode);

    @Query("SELECT COUNT(u) FROM User u JOIN u.role r WHERE r.code = 'ADMIN'")
    Long countAdminUsers();

    @Query("SELECT COUNT(u) FROM User u JOIN u.role r WHERE r.code = 'MODERATOR'")
    Long countModeratorUsers();

    @Query("SELECT COUNT(u) FROM User u JOIN u.role r WHERE r.code = 'MENTOR'")
    Long countMentorUsers();

    @Query("SELECT COUNT(u) FROM User u JOIN u.role r WHERE r.code = 'CUSTOMER'")
    Long countCustomerUsers();

}
