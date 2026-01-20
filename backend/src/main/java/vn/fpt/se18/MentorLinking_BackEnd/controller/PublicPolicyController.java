package vn.fpt.se18.MentorLinking_BackEnd.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PolicyResponse;
import vn.fpt.se18.MentorLinking_BackEnd.enums.PolicyType;
import vn.fpt.se18.MentorLinking_BackEnd.service.PolicyService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/policies")
@RequiredArgsConstructor
public class PublicPolicyController {

    private final PolicyService policyService;

    @GetMapping("/active")
    public BaseResponse<List<PolicyResponse>> getActivePoliciesByType(@RequestParam PolicyType type) {


        List<PolicyResponse> policies = policyService.getActivePoliciesByType(type);

        return BaseResponse.<List<PolicyResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get active policies by type successfully")
                .data(policies)
                .build();
    }
}