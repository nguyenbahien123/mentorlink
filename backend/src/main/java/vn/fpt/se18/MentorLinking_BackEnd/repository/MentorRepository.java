package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;

@Repository
public interface MentorRepository extends JpaRepository<User, Long> {

    @Query("SELECT DISTINCT u FROM User u " +
            "JOIN u.role r " +
            "JOIN u.status s " +
            "LEFT JOIN FETCH u.mentorCountries mc " +
            "LEFT JOIN FETCH mc.country c " +
            "LEFT JOIN FETCH mc.status mcs " +
            "WHERE r.name = 'MENTOR' " +
            "AND s.code = 'APPROVED' " +
            "AND (u.isBlocked = false OR u.isBlocked IS NULL)" )
//            " ORDER BY u.numberOfBooking ASC")
    Page<User> getAllMentorWithRelatedData(Pageable pageable);

    @Query("SELECT DISTINCT u FROM User u " +
            "JOIN u.role r " +
            "JOIN u.status s " +
            "LEFT JOIN u.mentorEducations me " +
            "LEFT JOIN u.mentorExperiences mexp " +
            "LEFT JOIN u.mentorServices ms " +
            "LEFT JOIN u.mentorTests mt " +
            "LEFT JOIN FETCH u.mentorCountries mc " +
            "LEFT JOIN FETCH mc.country c " +
            "LEFT JOIN FETCH mc.status mcs " +
            "WHERE r.name = 'MENTOR' " +
            "AND s.code = 'APPROVED' " +
            "AND (u.isBlocked = false OR u.isBlocked IS NULL) " +
            "AND (LOWER(u.fullname) LIKE :keyword OR " +
            "LOWER(u.title) LIKE :keyword OR " +
            "LOWER(u.intro) LIKE :keyword OR " +
            "LOWER(me.schoolName) LIKE :keyword OR " +
            "LOWER(me.major) LIKE :keyword OR " +
            "LOWER(mexp.companyName) LIKE :keyword OR " +
            "LOWER(mexp.position) LIKE :keyword)")
    Page<User> searchByKeyword(String keyword, Pageable pageable);

    @Query("SELECT DISTINCT u FROM User u " +
            "JOIN u.role r " +
            "JOIN u.status s " +
            "LEFT JOIN FETCH u.mentorCountries mc " +
            "LEFT JOIN FETCH mc.country c " +
            "LEFT JOIN FETCH mc.status mcs " +
            "WHERE r.name = 'MENTOR' " +
            "AND s.code = 'APPROVED' " +
            "AND (u.isBlocked = false OR u.isBlocked IS NULL) " +
            "AND EXISTS (SELECT 1 FROM u.mentorCountries mc2 JOIN mc2.country c2 JOIN mc2.status mcs2 WHERE mcs2.code = 'APPROVED' AND LOWER(c2.name) = LOWER(:country))")
    Page<User> searchByCountry(String country, Pageable pageable);

    @Query("SELECT DISTINCT u FROM User u " +
            "JOIN u.role r " +
            "JOIN u.status s " +
            "LEFT JOIN u.mentorEducations me " +
            "LEFT JOIN u.mentorExperiences mexp " +
            "LEFT JOIN u.mentorServices ms " +
            "LEFT JOIN u.mentorTests mt " +
            "LEFT JOIN FETCH u.mentorCountries mc " +
            "LEFT JOIN FETCH mc.country c " +
            "LEFT JOIN FETCH mc.status mcs " +
            "WHERE r.name = 'MENTOR' " +
            "AND s.code = 'APPROVED' " +
            "AND (u.isBlocked = false OR u.isBlocked IS NULL) " +
            "AND EXISTS (SELECT 1 FROM u.mentorCountries mc2 JOIN mc2.country c2 JOIN mc2.status mcs2 WHERE mcs2.code = 'APPROVED' AND LOWER(c2.name) = LOWER(:country)) " +
            "AND (LOWER(u.fullname) LIKE :keyword OR " +
            "LOWER(u.title) LIKE :keyword OR " +
            "LOWER(u.intro) LIKE :keyword OR " +
            "LOWER(me.schoolName) LIKE :keyword OR " +
            "LOWER(me.major) LIKE :keyword OR " +
            "LOWER(mexp.companyName) LIKE :keyword OR " +
            "LOWER(mexp.position) LIKE :keyword)")
    Page<User> searchByKeywordAndCountry(String keyword, String country, Pageable pageable);


    @Query("SELECT u FROM User u " +
            "JOIN FETCH u.role r " +
            "JOIN FETCH u.status s " +
            "LEFT JOIN FETCH u.mentorCountries mc " +
            "LEFT JOIN FETCH mc.country c " +
            "LEFT JOIN FETCH mc.status mcs " +
            "WHERE r.name = 'MENTOR' " +
            "AND s.code = 'APPROVED' " +
            "AND (u.isBlocked = false OR u.isBlocked IS NULL) " +
            "AND u.id = :id")
    User getMentorByIdWithRelatedData(@org.springframework.data.repository.query.Param("id") Long id);

}
