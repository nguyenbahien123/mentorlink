package vn.fpt.se18.MentorLinking_BackEnd.dto.response.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatisticsResponse {
    private Long totalUsers;
    private Long totalMentors;
    private Long totalUserBlocked;
    private Long totalMentorPending;
}
