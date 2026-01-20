package vn.fpt.se18.MentorLinking_BackEnd.controller.mentor;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor.MentorServiceRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorServiceResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorService;

import java.util.List;

@RestController
@RequestMapping("/mentor/services")
@RequiredArgsConstructor
@Slf4j
public class MentorServiceController {

    private final MentorService mentorService;

    /**
     * Create new mentor service - Always set status to PENDING
     */
    @PostMapping("/{mentorId}")
    public ResponseEntity<BaseResponse<MentorServiceResponse>> createMentorService(
            @PathVariable Long mentorId,
            @Valid @RequestBody MentorServiceRequest request) {
        log.info("Creating mentor service for mentor ID: {}", mentorId);

        MentorServiceResponse response = mentorService.createMentorService(mentorId, request);

        BaseResponse<MentorServiceResponse> apiResponse = BaseResponse.<MentorServiceResponse>builder()
                .respCode("0")
                .description("Mentor service created successfully and pending for approval")
                .data(response)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    /**
     * Get mentor service by ID - Only return APPROVED services
     */
    @GetMapping("/{serviceId}")
    public ResponseEntity<BaseResponse<MentorServiceResponse>> getMentorServiceById(
            @PathVariable Long serviceId) {
        log.info("Getting mentor service by ID: {}", serviceId);

        MentorServiceResponse response = mentorService.getMentorServiceById(serviceId);

        // Chỉ trả về service nếu đã được APPROVED
        if (!"APPROVED".equals(response.getStatusCode())) {
            log.warn("Mentor service ID: {} is not approved, status: {}", serviceId, response.getStatusCode());

            BaseResponse<MentorServiceResponse> apiResponse = BaseResponse.<MentorServiceResponse>builder()
                    .respCode("404")
                    .description("Mentor service not found or not approved")
                    .build();

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiResponse);
        }

        BaseResponse<MentorServiceResponse> apiResponse = BaseResponse.<MentorServiceResponse>builder()
                .respCode("0")
                .description("Mentor service retrieved successfully")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * Get all services by mentor ID
     */
    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<BaseResponse<List<MentorServiceResponse>>> getMentorServicesByMentorId(
            @PathVariable Long mentorId) {
        log.info("Getting all mentor services for mentor ID: {}", mentorId);

        List<MentorServiceResponse> response = mentorService.getMentorServicesByMentorId(mentorId);

        BaseResponse<List<MentorServiceResponse>> apiResponse = BaseResponse.<List<MentorServiceResponse>>builder()
                .respCode("0")
                .description("Mentor services retrieved successfully")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * Get mentor services with pagination
     */
    @GetMapping("/mentor/{mentorId}/paginated")
    public ResponseEntity<BaseResponse<Page<MentorServiceResponse>>> getMentorServicesPaginated(
            @PathVariable Long mentorId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Getting mentor services paginated for mentor ID: {}, page: {}, size: {}", mentorId, page, size);

        Page<MentorServiceResponse> response = mentorService.getMentorServicesPaginated(mentorId, page, size);

        BaseResponse<Page<MentorServiceResponse>> apiResponse = BaseResponse.<Page<MentorServiceResponse>>builder()
                .respCode("0")
                .description("Mentor services retrieved successfully")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * Update mentor service - Always set status to PENDING after update
     */
    @PutMapping("/{serviceId}/mentor/{mentorId}")
    public ResponseEntity<BaseResponse<MentorServiceResponse>> updateMentorService(
            @PathVariable Long serviceId,
            @PathVariable Long mentorId,
            @Valid @RequestBody MentorServiceRequest request) {
        log.info("Updating mentor service ID: {} for mentor ID: {}", serviceId, mentorId);

        MentorServiceResponse response = mentorService.updateMentorService(serviceId, mentorId, request);

        BaseResponse<MentorServiceResponse> apiResponse = BaseResponse.<MentorServiceResponse>builder()
                .respCode("0")
                .description("Mentor service updated successfully and pending for approval")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * Delete mentor service
     */
    @DeleteMapping("/{serviceId}/mentor/{mentorId}")
    public ResponseEntity<BaseResponse<Void>> deleteMentorService(
            @PathVariable Long serviceId,
            @PathVariable Long mentorId) {
        log.info("Deleting mentor service ID: {} for mentor ID: {}", serviceId, mentorId);

        mentorService.deleteMentorService(serviceId, mentorId);

        BaseResponse<Void> apiResponse = BaseResponse.<Void>builder()
                .respCode("0")
                .description("Mentor service deleted successfully")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * Get services by mentor ID and status
     */
    @GetMapping("/mentor/{mentorId}/status/{statusCode}")
    public ResponseEntity<BaseResponse<List<MentorServiceResponse>>> getServicesByMentorAndStatus(
            @PathVariable Long mentorId,
            @PathVariable String statusCode) {
        log.info("Getting services for mentor ID: {} with status: {}", mentorId, statusCode);

        List<MentorServiceResponse> response = mentorService.getServicesByMentorAndStatus(mentorId, statusCode);

        BaseResponse<List<MentorServiceResponse>> apiResponse = BaseResponse.<List<MentorServiceResponse>>builder()
                .respCode("0")
                .description("Services retrieved successfully")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * Public endpoint - Get all approved services (for end-users)
     */
    @GetMapping("/approved")
    public ResponseEntity<BaseResponse<List<MentorServiceResponse>>> getAllApprovedServices() {
        log.info("Getting all approved mentor services (public)");

        List<MentorServiceResponse> response = mentorService.getAllApprovedServices();

        BaseResponse<List<MentorServiceResponse>> apiResponse = BaseResponse.<List<MentorServiceResponse>>builder()
                .respCode("0")
                .description("Approved mentor services retrieved successfully")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * Public endpoint - Get all approved services for a given mentor (by mentorId)
     */
    @GetMapping("/mentor/{mentorId}/approved")
    public ResponseEntity<BaseResponse<List<MentorServiceResponse>>> getApprovedServicesByMentorId(
            @PathVariable Long mentorId) {
        log.info("Getting approved mentor services for mentor ID: {}", mentorId);

        List<MentorServiceResponse> response = mentorService.getServicesByMentorAndStatus(mentorId, "APPROVED");

        BaseResponse<List<MentorServiceResponse>> apiResponse = BaseResponse.<List<MentorServiceResponse>>builder()
                .respCode("0")
                .description("Approved mentor services for mentor " + mentorId + " retrieved successfully")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    // ===== Admin endpoints (for approval/rejection) =====

    /**
     * Get all services by status (Admin only)
     */
    @GetMapping("/admin/status/{statusCode}")
    public ResponseEntity<BaseResponse<List<MentorServiceResponse>>> getServicesByStatus(
            @PathVariable String statusCode) {
        log.info("Getting services by status: {}", statusCode);

        List<MentorServiceResponse> response = mentorService.getServicesByStatus(statusCode);

        BaseResponse<List<MentorServiceResponse>> apiResponse = BaseResponse.<List<MentorServiceResponse>>builder()
                .respCode("0")
                .description("Services retrieved successfully")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * Search services by keyword and status (Admin only)
     */
    @GetMapping("/admin/search")
    public ResponseEntity<BaseResponse<Page<MentorServiceResponse>>> searchServicesByKeywordAndStatus(
            @RequestParam String keyword,
            @RequestParam String statusCode,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Searching services by keyword: {}, status: {}", keyword, statusCode);

        Page<MentorServiceResponse> response = mentorService.searchServicesByKeywordAndStatus(keyword, statusCode, page, size);

        BaseResponse<Page<MentorServiceResponse>> apiResponse = BaseResponse.<Page<MentorServiceResponse>>builder()
                .respCode("0")
                .description("Services searched successfully")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * Approve service (Admin only)
     */
    @PutMapping("/admin/{serviceId}/approve")
    public ResponseEntity<BaseResponse<MentorServiceResponse>> approveService(
            @PathVariable Long serviceId) {
        log.info("Approving service ID: {}", serviceId);

        MentorServiceResponse response = mentorService.approveService(serviceId);

        BaseResponse<MentorServiceResponse> apiResponse = BaseResponse.<MentorServiceResponse>builder()
                .respCode("0")
                .description("Service approved successfully")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * Reject service (Admin only)
     */
    @PutMapping("/admin/{serviceId}/reject")
    public ResponseEntity<BaseResponse<MentorServiceResponse>> rejectService(
            @PathVariable Long serviceId) {
        log.info("Rejecting service ID: {}", serviceId);

        MentorServiceResponse response = mentorService.rejectService(serviceId);

        BaseResponse<MentorServiceResponse> apiResponse = BaseResponse.<MentorServiceResponse>builder()
                .respCode("0")
                .description("Service rejected successfully")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}
