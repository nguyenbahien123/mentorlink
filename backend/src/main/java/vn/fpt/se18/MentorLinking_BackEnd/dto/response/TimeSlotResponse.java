package vn.fpt.se18.MentorLinking_BackEnd.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotResponse {
    private Long timeSlotId;

    private Integer timeStart;

    private Integer timeEnd;
}
