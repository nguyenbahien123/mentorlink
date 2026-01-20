package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.PolicyRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PolicyResponse;

import java.util.List;

public interface CustomerPolicyService {

    /**
     * Get all customer policies
     */
    List<PolicyResponse> getAllCustomerPolicies();

    /**
     * Get all active customer policies
     */
    List<PolicyResponse> getActiveCustomerPolicies();

    /**
     * Get customer policy by ID
     */
    PolicyResponse getCustomerPolicyById(Long id);

    /**
     * Create new customer policy
     */
    PolicyResponse createCustomerPolicy(PolicyRequest request);

    /**
     * Update customer policy
     */
    PolicyResponse updateCustomerPolicy(Long id, PolicyRequest request);

    /**
     * Delete customer policy
     */
    void deleteCustomerPolicy(Long id);

    /**
     * Toggle active status of customer policy
     */
    PolicyResponse toggleActiveStatus(Long id);

    /**
     * Search customer policies by title
     */
    List<PolicyResponse> searchCustomerPoliciesByTitle(String keyword);
}
