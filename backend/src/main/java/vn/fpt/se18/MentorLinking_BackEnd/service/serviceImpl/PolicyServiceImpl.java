package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.PolicyRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PolicyPageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PolicyResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PolicyStatsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Policy;
import vn.fpt.se18.MentorLinking_BackEnd.enums.PolicyType;
import vn.fpt.se18.MentorLinking_BackEnd.repository.PolicyRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.PolicyService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PolicyServiceImpl implements PolicyService {

    private final PolicyRepository policyRepository;

    @Override
    @Transactional(readOnly = true)
    public PolicyPageResponse getAllPolicies(PolicyType type, Pageable pageable) {
        Page<Policy> policyPageEntity = policyRepository.findByType(type, pageable);
        Page<PolicyResponse> policyPageDto = policyPageEntity.map(this::mapToResponse);
        PolicyStatsResponse stats = getPolicyStats(type);
        return PolicyPageResponse.builder()
                .policyPage(policyPageDto)
                .stats(stats)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PolicyPageResponse searchPoliciesByTitle(PolicyType type, String keyword, Pageable pageable) {
        Page<Policy> policyPageEntity = policyRepository.findByTypeAndTitleContainingIgnoreCase(type, keyword, pageable);
        Page<PolicyResponse> policyPageDto = policyPageEntity.map(this::mapToResponse);
        PolicyStatsResponse stats = getPolicyStats(type);
        return PolicyPageResponse.builder()
                .policyPage(policyPageDto)
                .stats(stats)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PolicyResponse getPolicyById(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        return mapToResponse(policy);
    }

    @Override
    public PolicyResponse createPolicy(PolicyRequest request) {
        Policy policy = Policy.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .isActive(request.getIsActive())
                .type(request.getType())
                .build();

        Policy savedPolicy = policyRepository.save(policy);
        return mapToResponse(savedPolicy);
    }

    @Override
    public PolicyResponse updatePolicy(Long id, PolicyRequest request) {
        Policy existingPolicy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));

        existingPolicy.setTitle(request.getTitle());
        existingPolicy.setContent(request.getContent());
        existingPolicy.setIsActive(request.getIsActive());
        existingPolicy.setType(request.getType());

        Policy updatedPolicy = policyRepository.save(existingPolicy);
        return mapToResponse(updatedPolicy);
    }

    @Override
    public void deletePolicy(Long id) {
        if (!policyRepository.existsById(id)) {
            throw new RuntimeException("Policy not found with id: " + id);
        }
        policyRepository.deleteById(id);
    }

    @Override
    public PolicyResponse toggleActiveStatus(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));

        policy.setIsActive(!policy.getIsActive());
        Policy updatedPolicy = policyRepository.save(policy);
        return mapToResponse(updatedPolicy);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PolicyResponse> getActivePoliciesByType(PolicyType type) {
        List<Policy> policies = policyRepository.findByTypeAndIsActiveTrue(type);

        return policies.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PolicyStatsResponse getPolicyStats(PolicyType type) {
        long total = policyRepository.countByType(type);
        long active = policyRepository.countByTypeAndIsActiveTrue(type);
        long inactive = total - active;

        return PolicyStatsResponse.builder()
                .totalPolicies(total)
                .totalActive(active)
                .totalInactive(inactive)
                .build();
    }

    private PolicyResponse mapToResponse(Policy policy) {
        return PolicyResponse.builder()
                .id(policy.getId())
                .title(policy.getTitle())
                .content(policy.getContent())
                .isActive(policy.getIsActive())
                .type(policy.getType())
                .createdAt(policy.getCreatedAt())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }
}