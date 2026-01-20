package vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor;

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
public class BookingTimeSlotResponse {
    private Integer timeStart;
    private Integer timeEnd;
}
