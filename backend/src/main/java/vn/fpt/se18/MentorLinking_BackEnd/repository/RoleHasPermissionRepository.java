package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.RoleHasPermission;

import java.util.List;

@Repository
public interface RoleHasPermissionRepository extends JpaRepository<RoleHasPermission, Integer> {

    @Query("SELECT rp FROM RoleHasPermission rp WHERE rp.role.id = :roleId")
    List<RoleHasPermission> findByRoleId(@Param("roleId") Long roleId);

    @Modifying
    @Query("DELETE FROM RoleHasPermission rp WHERE rp.role.id = :roleId")
    void deleteByRoleId(@Param("roleId") Long roleId);

    @Query("SELECT rp FROM RoleHasPermission rp JOIN FETCH rp.permission WHERE rp.role.id = :roleId")
    List<RoleHasPermission> findByRoleIdWithPermissions(@Param("roleId") Long roleId);
}
