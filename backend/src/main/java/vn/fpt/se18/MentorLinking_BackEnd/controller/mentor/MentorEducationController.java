package vn.fpt.se18.MentorLinking_BackEnd.controller.mentor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor.MentorEducationRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorEducationResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorEducationService;

import java.util.List;

@RestController
@RequestMapping("/mentor/educations")
@RequiredArgsConstructor
@Slf4j
public class MentorEducationController {

    private final MentorEducationService mentorEducationService;

    @PostMapping("/{mentorId}")
    public ResponseEntity<BaseResponse<MentorEducationResponse>> createMentorEducation(
            @PathVariable Long mentorId,
            @RequestParam("schoolName") String schoolName,
            @RequestParam("major") String major,
            @RequestParam(value = "certificateImage", required = false) String certificateImage,
            @RequestParam(value = "startDate", required = false) java.time.LocalDate startDate,
            @RequestParam(value = "endDate", required = false) java.time.LocalDate endDate,
            @RequestParam(value = "scoreImageFile", required = false) MultipartFile scoreImageFile) {
        log.info("Creating mentor education for mentor ID: {}", mentorId);

        MentorEducationRequest request = MentorEducationRequest.builder()
                .schoolName(schoolName)
                .major(major)
                .certificateImage(certificateImage)
                .startDate(startDate)
                .endDate(endDate)
                .scoreImageFile(scoreImageFile)
                .build();

        MentorEducationResponse response = mentorEducationService.createMentorEducation(mentorId, request);
        BaseResponse<MentorEducationResponse> api = BaseResponse.<MentorEducationResponse>builder()
                .respCode("0")
                .description("Mentor education created and pending approval")
                .data(response)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(api);
    }

    @GetMapping("/{educationId}")
    public ResponseEntity<BaseResponse<MentorEducationResponse>> getMentorEducationById(@PathVariable Long educationId) {
        log.info("Getting mentor education by ID: {}", educationId);
        MentorEducationResponse response = mentorEducationService.getMentorEducationById(educationId);
        BaseResponse<MentorEducationResponse> api = BaseResponse.<MentorEducationResponse>builder()
                .respCode("0")
                .description("Mentor education retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<BaseResponse<List<MentorEducationResponse>>> getMentorEducationsByMentorId(@PathVariable Long mentorId) {
        log.info("Getting all mentor educations for mentor ID: {}", mentorId);
        List<MentorEducationResponse> response = mentorEducationService.getMentorEducationsByMentorId(mentorId);
        BaseResponse<List<MentorEducationResponse>> api = BaseResponse.<List<MentorEducationResponse>>builder()
                .respCode("0")
                .description("Mentor educations retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @GetMapping("/mentor/{mentorId}/paginated")
    public ResponseEntity<BaseResponse<Page<MentorEducationResponse>>> getMentorEducationsPaginated(
            @PathVariable Long mentorId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Getting mentor educations paginated for mentor ID: {}, page: {}, size: {}", mentorId, page, size);
        Page<MentorEducationResponse> response = mentorEducationService.getMentorEducationsPaginated(mentorId, page, size);
        BaseResponse<Page<MentorEducationResponse>> api = BaseResponse.<Page<MentorEducationResponse>>builder()
                .respCode("0")
                .description("Mentor educations retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @PutMapping("/{educationId}/mentor/{mentorId}")
    public ResponseEntity<BaseResponse<MentorEducationResponse>> updateMentorEducation(
            @PathVariable Long educationId,
            @PathVariable Long mentorId,
            @RequestParam("schoolName") String schoolName,
            @RequestParam("major") String major,
            @RequestParam(value = "certificateImage", required = false) String certificateImage,
            @RequestParam(value = "startDate", required = false) java.time.LocalDate startDate,
            @RequestParam(value = "endDate", required = false) java.time.LocalDate endDate,
            @RequestParam(value = "scoreImageFile", required = false) MultipartFile scoreImageFile) {
        log.info("Updating mentor education ID: {} for mentor ID: {}", educationId, mentorId);

        MentorEducationRequest request = MentorEducationRequest.builder()
                .schoolName(schoolName)
                .major(major)
                .certificateImage(certificateImage)
                .startDate(startDate)
                .endDate(endDate)
                .scoreImageFile(scoreImageFile)
                .build();

        MentorEducationResponse response = mentorEducationService.updateMentorEducation(educationId, mentorId, request);
        BaseResponse<MentorEducationResponse> api = BaseResponse.<MentorEducationResponse>builder()
                .respCode("0")
                .description("Mentor education updated and pending approval")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @DeleteMapping("/{educationId}/mentor/{mentorId}")
    public ResponseEntity<BaseResponse<Void>> deleteMentorEducation(
            @PathVariable Long educationId,
            @PathVariable Long mentorId) {
        log.info("Deleting mentor education ID: {} for mentor ID: {}", educationId, mentorId);
        mentorEducationService.deleteMentorEducation(educationId, mentorId);
        BaseResponse<Void> api = BaseResponse.<Void>builder()
                .respCode("0")
                .description("Mentor education deleted successfully")
                .build();
        return ResponseEntity.ok(api);
    }

    @GetMapping("/mentor/{mentorId}/status/{statusCode}")
    public ResponseEntity<BaseResponse<List<MentorEducationResponse>>> getEducationsByMentorAndStatus(
            @PathVariable Long mentorId,
            @PathVariable String statusCode) {
        log.info("Getting educations for mentor ID: {} with status: {}", mentorId, statusCode);
        List<MentorEducationResponse> response = mentorEducationService.getEducationsByMentorAndStatus(mentorId, statusCode);
        BaseResponse<List<MentorEducationResponse>> api = BaseResponse.<List<MentorEducationResponse>>builder()
                .respCode("0")
                .description("Mentor educations retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @GetMapping("/approved")
    public ResponseEntity<BaseResponse<List<MentorEducationResponse>>> getAllApprovedEducations() {
        log.info("Getting all approved mentor educations (public)");
        List<MentorEducationResponse> response = mentorEducationService.getAllApprovedEducations();
        BaseResponse<List<MentorEducationResponse>> api = BaseResponse.<List<MentorEducationResponse>>builder()
                .respCode("0")
                .description("Approved mentor educations retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @GetMapping("/mentor/{mentorId}/approved")
    public ResponseEntity<BaseResponse<List<MentorEducationResponse>>> getApprovedEducationsByMentorId(@PathVariable Long mentorId) {
        log.info("Getting approved mentor educations for mentor ID: {}", mentorId);
        List<MentorEducationResponse> response = mentorEducationService.getEducationsByMentorAndStatus(mentorId, "APPROVED");
        BaseResponse<List<MentorEducationResponse>> api = BaseResponse.<List<MentorEducationResponse>>builder()
                .respCode("0")
                .description("Approved mentor educations for mentor " + mentorId + " retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    // Admin actions
    @PutMapping("/admin/{educationId}/approve")
    public ResponseEntity<BaseResponse<MentorEducationResponse>> approveEducation(@PathVariable Long educationId) {
        log.info("Approving education ID: {}", educationId);
        MentorEducationResponse response = mentorEducationService.approveEducation(educationId);
        BaseResponse<MentorEducationResponse> api = BaseResponse.<MentorEducationResponse>builder()
                .respCode("0")
                .description("Education approved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @PutMapping("/admin/{educationId}/reject")
    public ResponseEntity<BaseResponse<MentorEducationResponse>> rejectEducation(@PathVariable Long educationId) {
        log.info("Rejecting education ID: {}", educationId);
        MentorEducationResponse response = mentorEducationService.rejectEducation(educationId);
        BaseResponse<MentorEducationResponse> api = BaseResponse.<MentorEducationResponse>builder()
                .respCode("0")
                .description("Education rejected successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }
}

