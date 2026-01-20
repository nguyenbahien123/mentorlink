package vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor;

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
public class MentorHandleBookingRequest {
    private Long bookingId;
    private String action;
    private String cancelReason = "";
}
