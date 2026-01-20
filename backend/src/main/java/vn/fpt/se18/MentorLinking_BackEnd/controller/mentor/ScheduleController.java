package vn.fpt.se18.MentorLinking_BackEnd.controller.mentor;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.ScheduleRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.ScheduleResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.ScheduleService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
@Tag(name = "Schedule Controller")
@Slf4j
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/mentor/{mentorId}/upcoming")
    public BaseResponse<List<ScheduleResponse>> getUpcomingSchedulesForMentor(@PathVariable("mentorId") Long mentorId) {
        try {
            List<ScheduleResponse> data = scheduleService.getUpcomingSchedulesForMentor(mentorId);
            return BaseResponse.<List<ScheduleResponse>>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .description("Get upcoming schedules for mentor successfully")
                    .data(data)
                    .build();
        } catch (Exception e) {
            log.error("Error getting upcoming schedules for mentor: {}", e.getMessage());
            return BaseResponse.<List<ScheduleResponse>>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("1")
                    .description("Failed to get upcoming schedules: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping("/mentor/{mentorId}")
    @ResponseStatus(HttpStatus.CREATED)
    public BaseResponse<ScheduleResponse> createSchedule(
            @PathVariable("mentorId") Long mentorId,
            @Valid @RequestBody ScheduleRequest scheduleRequest) {
        try {
            ScheduleResponse data = scheduleService.createSchedule(scheduleRequest, mentorId);
            return BaseResponse.<ScheduleResponse>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .description("Schedule created successfully")
                    .data(data)
                    .build();
        } catch (Exception e) {
            log.error("Error creating schedule: {}", e.getMessage());
            return BaseResponse.<ScheduleResponse>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("1")
                    .description("Failed to create schedule: " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/{scheduleId}")
    public BaseResponse<ScheduleResponse> getScheduleById(@PathVariable("scheduleId") Long scheduleId) {
        try {
            ScheduleResponse data = scheduleService.getScheduleById(scheduleId);
            return BaseResponse.<ScheduleResponse>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .description("Get schedule successfully")
                    .data(data)
                    .build();
        } catch (Exception e) {
            log.error("Error getting schedule by id: {}", e.getMessage());
            return BaseResponse.<ScheduleResponse>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("1")
                    .description("Failed to get schedule: " + e.getMessage())
                    .build();
        }
    }

    @PutMapping("/{scheduleId}/mentor/{mentorId}")
    public BaseResponse<ScheduleResponse> updateSchedule(
            @PathVariable("scheduleId") Long scheduleId,
            @PathVariable("mentorId") Long mentorId,
            @Valid @RequestBody ScheduleRequest scheduleRequest) {
        try {
            ScheduleResponse data = scheduleService.updateSchedule(scheduleId, scheduleRequest, mentorId);
            return BaseResponse.<ScheduleResponse>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .description("Schedule updated successfully")
                    .data(data)
                    .build();
        } catch (Exception e) {
            log.error("Error updating schedule: {}", e.getMessage());
            return BaseResponse.<ScheduleResponse>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("1")
                    .description("Failed to update schedule: " + e.getMessage())
                    .build();
        }
    }

    @DeleteMapping("/{scheduleId}/mentor/{mentorId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public BaseResponse<Void> deleteSchedule(
            @PathVariable("scheduleId") Long scheduleId,
            @PathVariable("mentorId") Long mentorId) {
        try {
            scheduleService.deleteSchedule(scheduleId, mentorId);
            return BaseResponse.<Void>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .description("Schedule deleted successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error deleting schedule: {}", e.getMessage());
            return BaseResponse.<Void>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("1")
                    .description("Failed to delete schedule: " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/mentor/{mentorId}")
    public BaseResponse<List<ScheduleResponse>> getAllSchedulesForMentor(@PathVariable("mentorId") Long mentorId) {
        try {
            List<ScheduleResponse> data = scheduleService.getAllSchedulesForMentor(mentorId);
            return BaseResponse.<List<ScheduleResponse>>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .description("Get all schedules for mentor successfully")
                    .data(data)
                    .build();
        } catch (Exception e) {
            log.error("Error getting all schedules for mentor: {}", e.getMessage());
            return BaseResponse.<List<ScheduleResponse>>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("1")
                    .description("Failed to get schedules: " + e.getMessage())
                    .build();
        }
    }
}
