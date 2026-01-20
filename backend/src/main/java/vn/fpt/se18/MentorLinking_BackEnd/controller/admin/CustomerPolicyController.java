package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.PolicyRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PolicyResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.CustomerPolicyService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/customer-policies")
@RequiredArgsConstructor
@Slf4j
public class CustomerPolicyController {

    private final CustomerPolicyService customerPolicyService;

    @GetMapping
    public BaseResponse<List<PolicyResponse>> getAllCustomerPolicies() {
        log.info("Getting all customer policies");
        return BaseResponse.<List<PolicyResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get all customer policies successfully")
                .data(customerPolicyService.getAllCustomerPolicies())
                .build();
    }

    @GetMapping("/active")
    public BaseResponse<List<PolicyResponse>> getActiveCustomerPolicies() {
        log.info("Getting all active customer policies");
        return BaseResponse.<List<PolicyResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get active customer policies successfully")
                .data(customerPolicyService.getActiveCustomerPolicies())
                .build();
    }

    @GetMapping("/{id}")
    public BaseResponse<PolicyResponse> getCustomerPolicyById(@PathVariable Long id) {
        log.info("Getting customer policy by id: {}", id);
        return BaseResponse.<PolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get customer policy successfully")
                .data(customerPolicyService.getCustomerPolicyById(id))
                .build();
    }

    @PostMapping
    public BaseResponse<PolicyResponse> createCustomerPolicy(@Valid @RequestBody PolicyRequest request) {
        log.info("Creating new customer policy with title: {}", request.getTitle());
        return BaseResponse.<PolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Customer policy created successfully")
                .data(customerPolicyService.createCustomerPolicy(request))
                .build();
    }

    @PutMapping("/{id}")
    public BaseResponse<PolicyResponse> updateCustomerPolicy(@PathVariable Long id,
                                                             @Valid @RequestBody PolicyRequest request) {
        log.info("Updating customer policy with id: {}", id);
        return BaseResponse.<PolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Customer policy updated successfully")
                .data(customerPolicyService.updateCustomerPolicy(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public BaseResponse<Void> deleteCustomerPolicy(@PathVariable Long id) {
        log.info("Deleting customer policy with id: {}", id);
        customerPolicyService.deleteCustomerPolicy(id);
        return BaseResponse.<Void>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Customer policy deleted successfully")
                .build();
    }

    @PatchMapping("/{id}/toggle-status")
    public BaseResponse<PolicyResponse> toggleActiveStatus(@PathVariable Long id) {
        log.info("Toggling active status for customer policy with id: {}", id);
        return BaseResponse.<PolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Customer policy status toggled successfully")
                .data(customerPolicyService.toggleActiveStatus(id))
                .build();
    }

    @GetMapping("/search")
    public BaseResponse<List<PolicyResponse>> searchCustomerPolicies(@RequestParam String keyword) {
        log.info("Searching customer policies with keyword: {}", keyword);
        return BaseResponse.<List<PolicyResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Search customer policies successfully")
                .data(customerPolicyService.searchCustomerPoliciesByTitle(keyword))
                .build();
    }
}
