package vn.fpt.se18.MentorLinking_BackEnd.controller.mentor;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.TimeSlotResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.TimeSlotService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/time-slots")
@RequiredArgsConstructor
@Tag(name = "Time Slot Controller")
@Slf4j
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    @GetMapping
    public BaseResponse<List<TimeSlotResponse>> getAllTimeSlots() {
        try {
            List<TimeSlotResponse> data = timeSlotService.getAllTimeSlots();
            return BaseResponse.<List<TimeSlotResponse>>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .description("Get all time slots successfully")
                    .data(data)
                    .build();
        } catch (Exception e) {
            log.error("Error getting all time slots: {}", e.getMessage());
            return BaseResponse.<List<TimeSlotResponse>>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("1")
                    .description("Failed to get time slots: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping("/init")
    public BaseResponse<String> initTimeSlots() {
        try {
            String result = timeSlotService.initTimeSlots();
            return BaseResponse.<String>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .description("Initialize time slots successfully")
                    .data(result)
                    .build();
        } catch (Exception e) {
            log.error("Error initializing time slots: {}", e.getMessage());
            return BaseResponse.<String>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("1")
                    .description("Failed to initialize time slots: " + e.getMessage())
                    .build();
        }
    }
}