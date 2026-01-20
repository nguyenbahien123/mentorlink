package vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse implements Serializable {
    private Long id;
    private BookingCustomerProfileResponse customer;
    private String service;
    private LocalDate date;
    private BookingTimeSlotResponse timeSlot;
    private String status;
    private LocalDateTime createdAt;
    private String note;
    private String comment;
    private Integer rating;
    private String review;
}
