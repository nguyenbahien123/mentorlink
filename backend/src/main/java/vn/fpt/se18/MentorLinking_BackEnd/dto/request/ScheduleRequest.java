package vn.fpt.se18.MentorLinking_BackEnd.dto.request;

import lombok.*;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleRequest {

    @NotNull(message = "date must not be null")
    // allow today or future dates
    @FutureOrPresent(message = "date must be today or in the future")
    private LocalDate date;

    @NotNull(message = "timeSlotIds must not be null")
    @NotEmpty(message = "timeSlotIds must contain at least one time slot")
    private Set<Long> timeSlotIds;

    @NotNull(message = "price must not be null")
    @Positive(message = "price must be greater than 0")
    private Double price;

}

