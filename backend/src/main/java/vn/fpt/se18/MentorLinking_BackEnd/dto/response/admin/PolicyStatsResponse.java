package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PolicyStatsResponse {
    private long totalPolicies;
    private long totalActive;
    private long totalInactive;


}