package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleDetailResponse {
    private Long id;
    
    // Mentor info
    private Long mentorId;
    private String mentorName;
    private String mentorEmail;
    
    // Schedule info
    private LocalDate date;
    private List<String> timeSlots;
    private String timeSlotText;
    private Double price;
    private Boolean isBooked;
    
    // Booking info (if booked)
    private Long bookingId;
    private String bookingStatus;
    private String customerName;
    private Boolean isCompleted;
}
