// ...existing code...
package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.request.ScheduleRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.ScheduleResponse;

import java.util.List;

public interface ScheduleService {
    /**
     * Get schedules for a mentor for today, tomorrow and the day after (3 days)
     * @param mentorId mentor id
     * @return list of ScheduleResponse
     */
    List<ScheduleResponse> getUpcomingSchedulesForMentor(Long mentorId);

    /**
     * Create a new schedule
     * @param scheduleRequest schedule request data
     * @param mentorId mentor id creating the schedule
     * @return created schedule response
     */
    ScheduleResponse createSchedule(ScheduleRequest scheduleRequest, Long mentorId);

    /**
     * Get schedule by id
     * @param scheduleId schedule id
     * @return schedule response
     */
    ScheduleResponse getScheduleById(Long scheduleId);

    /**
     * Update schedule by id
     * @param scheduleId schedule id
     * @param scheduleRequest updated schedule data
     * @param mentorId mentor id updating the schedule
     * @return updated schedule response
     */
    ScheduleResponse updateSchedule(Long scheduleId, ScheduleRequest scheduleRequest, Long mentorId);

    /**
     * Delete schedule by id
     * @param scheduleId schedule id
     * @param mentorId mentor id deleting the schedule
     */
    void deleteSchedule(Long scheduleId, Long mentorId);

    /**
     * Get all schedules for a mentor
     * @param mentorId mentor id
     * @return list of schedule responses
     */
    List<ScheduleResponse> getAllSchedulesForMentor(Long mentorId);
}
