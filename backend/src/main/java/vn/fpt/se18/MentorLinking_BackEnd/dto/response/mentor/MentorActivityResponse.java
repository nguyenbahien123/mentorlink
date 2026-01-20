package vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor;


import java.io.Serializable;
import java.util.List;
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
public class MentorActivityResponse implements Serializable {
    private List<BookingResponse> pending;
    private List<BookingResponse> confirmed;
    private List<BookingResponse> completed;
    private List<BookingResponse> cancelled;
}
