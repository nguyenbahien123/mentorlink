package vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor;

import java.io.Serializable;
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
public class BookingCustomerProfileResponse implements Serializable {
    private Long id;
    private String fullname;
    private String email;
    private String phone;
}
