package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleStatisticsResponse {

    private Long adminCount;
    private Long moderatorCount;
    private Long mentorCount;
    private Long customerCount;
    private Long totalRoles;
}
