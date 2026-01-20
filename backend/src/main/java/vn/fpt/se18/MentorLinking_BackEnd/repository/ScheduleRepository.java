// ...existing code...
package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Schedule;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    // Find schedules for a mentor between two dates (inclusive)
    @Query("select s from Schedule s where s.user.id = :mentorId and s.date between :from and :to")
    List<Schedule> findByMentorIdAndDateBetween(@Param("mentorId") Long mentorId,
                                               @Param("from") LocalDate from,
                                               @Param("to") LocalDate to);

    // Find all schedules for a mentor
    @Query("select s from Schedule s where s.user.id = :mentorId")
    List<Schedule> findByMentorId(@Param("mentorId") Long mentorId);

    // Find schedule by id and mentor id (for security)
    @Query("select s from Schedule s where s.id = :scheduleId and s.user.id = :mentorId")
    Optional<Schedule> findByIdAndMentorId(@Param("scheduleId") Long scheduleId, @Param("mentorId") Long mentorId);

    // Check if schedule exists for mentor on specific date and time slots (for duplicate prevention)
    @Query("select count(s) > 0 from Schedule s join s.timeSlots ts " +
           "where s.user.id = :mentorId and s.date = :date and ts.id in :timeSlotIds")
    boolean existsByMentorIdAndDateAndTimeSlotIds(@Param("mentorId") Long mentorId,
                                                  @Param("date") LocalDate date,
                                                  @Param("timeSlotIds") List<Long> timeSlotIds);
}
