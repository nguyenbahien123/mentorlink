package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.PolicyRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PolicyPageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PolicyResponse;
import vn.fpt.se18.MentorLinking_BackEnd.enums.PolicyType;
import vn.fpt.se18.MentorLinking_BackEnd.service.PolicyService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/admin/policies")
@RequiredArgsConstructor
@Slf4j
public class PolicyController {

    private final PolicyService policyService;

    @GetMapping
    public BaseResponse<PolicyPageResponse> getAllPolicies(
            @RequestParam PolicyType type,
            @PageableDefault(size = 10, sort = "createdAt,desc") Pageable pageable) {
        log.info("Getting all policies for type: {}", type);
        return BaseResponse.<PolicyPageResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get all policies successfully")
                .data(policyService.getAllPolicies(type, pageable))
                .build();
    }

    @GetMapping("/search")
    public BaseResponse<PolicyPageResponse> searchPolicies(
            @RequestParam PolicyType type, // Thêm
            @RequestParam String keyword,
            @PageableDefault(size = 10, sort = "createdAt,desc") Pageable pageable) {
        log.info("Searching policies for type: {} with keyword: {}", type, keyword);
        return BaseResponse.<PolicyPageResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Search policies successfully")
                .data(policyService.searchPoliciesByTitle(type, keyword, pageable))
                .build();
    }

    @GetMapping("/{id}")
    public BaseResponse<PolicyResponse> getPolicyById(@PathVariable Long id) {
        log.info("Getting policy by id: {}", id);
        return BaseResponse.<PolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get policy successfully")
                .data(policyService.getPolicyById(id))
                .build();
    }

    @PostMapping
    public BaseResponse<PolicyResponse> createPolicy(@Valid @RequestBody PolicyRequest request) {
        log.info("Creating new policy with title: {}", request.getTitle());
        return BaseResponse.<PolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Policy created successfully")
                .data(policyService.createPolicy(request))
                .build();
    }

    @PutMapping("/{id}")
    public BaseResponse<PolicyResponse> updatePolicy(@PathVariable Long id,
                                                     @Valid @RequestBody PolicyRequest request) {
        log.info("Updating policy with id: {}", id);
        return BaseResponse.<PolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Policy updated successfully")
                .data(policyService.updatePolicy(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public BaseResponse<Void> deletePolicy(@PathVariable Long id) {
        log.info("Deleting policy with id: {}", id);
        policyService.deletePolicy(id);
        return BaseResponse.<Void>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Policy deleted successfully")
                .build();
    }

    @PatchMapping("/{id}/toggle-status")
    public BaseResponse<PolicyResponse> toggleActiveStatus(@PathVariable Long id) {
        log.info("Toggling active status for policy with id: {}", id);
        return BaseResponse.<PolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Policy status toggled successfully")
                .data(policyService.toggleActiveStatus(id))
                .build();
    }
}