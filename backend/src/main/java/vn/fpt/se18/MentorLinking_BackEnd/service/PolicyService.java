package vn.fpt.se18.MentorLinking_BackEnd.service;

import org.springframework.data.domain.Pageable;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.PolicyRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PolicyPageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PolicyResponse;
import vn.fpt.se18.MentorLinking_BackEnd.enums.PolicyType;

import java.util.List;

public interface PolicyService {

    PolicyPageResponse getAllPolicies(PolicyType type, Pageable pageable);

    PolicyPageResponse searchPoliciesByTitle(PolicyType type, String keyword, Pageable pageable);

    PolicyResponse getPolicyById(Long id);

    PolicyResponse createPolicy(PolicyRequest request);

    PolicyResponse updatePolicy(Long id, PolicyRequest request);

    void deletePolicy(Long id);

    PolicyResponse toggleActiveStatus(Long id);

    List<PolicyResponse> getActivePoliciesByType(PolicyType type);
}