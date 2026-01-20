package vn.fpt.se18.MentorLinking_BackEnd.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {
    @NotNull(message = "Schedule ID không được để trống")
    private Long scheduleId;

    @NotBlank(message = "Description không được để trống")
    private String description;

    @NotBlank(message = "Service không được để trống")
    private String service;
}
