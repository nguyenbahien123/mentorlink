package vn.fpt.se18.MentorLinking_BackEnd.dto.response;


import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import vn.fpt.se18.MentorLinking_BackEnd.util.BookingService;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long bookingId;

    private Long mentorId;

    private String description;

    private String comment;

    private String paymentProcess; // COMPLETED, REFUNDED, WAIT_REFUND

    private String statusName; // Approved, Pending, Rejected,CANCELLED

    private String emailMentor;

    private String service;

    private String linkMeeting;

    private boolean isRead = false;

    private ScheduleResponse schedule;
}
