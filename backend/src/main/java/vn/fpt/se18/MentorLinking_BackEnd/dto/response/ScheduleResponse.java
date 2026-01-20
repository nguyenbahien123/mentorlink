package vn.fpt.se18.MentorLinking_BackEnd.dto.response;

import lombok.*;

import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {
    private Long scheduleId;

    private java.time.LocalDate date;

    private Set<TimeSlotResponse> timeSlots;

    private Double price;

    private String emailMentor;

    private Boolean isBooked;
}
