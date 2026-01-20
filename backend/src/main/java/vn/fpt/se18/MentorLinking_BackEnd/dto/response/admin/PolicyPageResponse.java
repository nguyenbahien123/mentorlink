package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Page;

@Getter
@Setter
@Builder
public class PolicyPageResponse {
    private Page<PolicyResponse> policyPage;
    private PolicyStatsResponse stats;

}