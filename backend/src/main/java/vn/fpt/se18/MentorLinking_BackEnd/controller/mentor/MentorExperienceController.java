package vn.fpt.se18.MentorLinking_BackEnd.controller.mentor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor.MentorExperienceRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorExperienceResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorExperienceService;

import java.util.List;

@RestController
@RequestMapping("/mentor/experiences")
@RequiredArgsConstructor
@Slf4j
public class MentorExperienceController {

    private final MentorExperienceService mentorExperienceService;

    @PostMapping("/{mentorId}")
    public ResponseEntity<BaseResponse<MentorExperienceResponse>> createMentorExperience(
            @PathVariable Long mentorId,
            @RequestParam("companyName") String companyName,
            @RequestParam("position") String position,
            @RequestParam(value = "startDate", required = false) java.time.LocalDate startDate,
            @RequestParam(value = "endDate", required = false) java.time.LocalDate endDate,
            @RequestParam(value = "experienceImage", required = false) String experienceImage,
            @RequestParam(value = "scoreImageFile", required = false) MultipartFile scoreImageFile) {
        log.info("Creating mentor experience for mentor ID: {}", mentorId);

        MentorExperienceRequest request = MentorExperienceRequest.builder()
                .companyName(companyName)
                .position(position)
                .startDate(startDate)
                .endDate(endDate)
                .experienceImage(experienceImage)
                .scoreImageFile(scoreImageFile)
                .build();

        MentorExperienceResponse response = mentorExperienceService.createMentorExperience(mentorId, request);
        BaseResponse<MentorExperienceResponse> api = BaseResponse.<MentorExperienceResponse>builder()
                .respCode("0")
                .description("Mentor experience created and pending approval")
                .data(response)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(api);
    }

    @GetMapping("/{experienceId}")
    public ResponseEntity<BaseResponse<MentorExperienceResponse>> getMentorExperienceById(@PathVariable Long experienceId) {
        log.info("Getting mentor experience by ID: {}", experienceId);
        MentorExperienceResponse response = mentorExperienceService.getMentorExperienceById(experienceId);
        BaseResponse<MentorExperienceResponse> api = BaseResponse.<MentorExperienceResponse>builder()
                .respCode("0")
                .description("Mentor experience retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<BaseResponse<List<MentorExperienceResponse>>> getMentorExperiencesByMentorId(@PathVariable Long mentorId) {
        log.info("Getting all mentor experiences for mentor ID: {}", mentorId);
        List<MentorExperienceResponse> response = mentorExperienceService.getMentorExperiencesByMentorId(mentorId);
        BaseResponse<List<MentorExperienceResponse>> api = BaseResponse.<List<MentorExperienceResponse>>builder()
                .respCode("0")
                .description("Mentor experiences retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @GetMapping("/mentor/{mentorId}/paginated")
    public ResponseEntity<BaseResponse<Page<MentorExperienceResponse>>> getMentorExperiencesPaginated(
            @PathVariable Long mentorId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Getting mentor experiences paginated for mentor ID: {}, page: {}, size: {}", mentorId, page, size);
        Page<MentorExperienceResponse> response = mentorExperienceService.getMentorExperiencesPaginated(mentorId, page, size);
        BaseResponse<Page<MentorExperienceResponse>> api = BaseResponse.<Page<MentorExperienceResponse>>builder()
                .respCode("0")
                .description("Mentor experiences retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @PutMapping("/{experienceId}/mentor/{mentorId}")
    public ResponseEntity<BaseResponse<MentorExperienceResponse>> updateMentorExperience(
            @PathVariable Long experienceId,
            @PathVariable Long mentorId,
            @RequestParam("companyName") String companyName,
            @RequestParam("position") String position,
            @RequestParam(value = "startDate", required = false) java.time.LocalDate startDate,
            @RequestParam(value = "endDate", required = false) java.time.LocalDate endDate,
            @RequestParam(value = "experienceImage", required = false) String experienceImage,
            @RequestParam(value = "scoreImageFile", required = false) MultipartFile scoreImageFile) {
        log.info("Updating mentor experience ID: {} for mentor ID: {}", experienceId, mentorId);

        MentorExperienceRequest request = MentorExperienceRequest.builder()
                .companyName(companyName)
                .position(position)
                .startDate(startDate)
                .endDate(endDate)
                .experienceImage(experienceImage)
                .scoreImageFile(scoreImageFile)
                .build();

        MentorExperienceResponse response = mentorExperienceService.updateMentorExperience(experienceId, mentorId, request);
        BaseResponse<MentorExperienceResponse> api = BaseResponse.<MentorExperienceResponse>builder()
                .respCode("0")
                .description("Mentor experience updated and pending approval")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @DeleteMapping("/{experienceId}/mentor/{mentorId}")
    public ResponseEntity<BaseResponse<Void>> deleteMentorExperience(
            @PathVariable Long experienceId,
            @PathVariable Long mentorId) {
        log.info("Deleting mentor experience ID: {} for mentor ID: {}", experienceId, mentorId);
        mentorExperienceService.deleteMentorExperience(experienceId, mentorId);
        BaseResponse<Void> api = BaseResponse.<Void>builder()
                .respCode("0")
                .description("Mentor experience deleted successfully")
                .build();
        return ResponseEntity.ok(api);
    }

    @GetMapping("/mentor/{mentorId}/status/{statusCode}")
    public ResponseEntity<BaseResponse<List<MentorExperienceResponse>>> getExperiencesByMentorAndStatus(
            @PathVariable Long mentorId,
            @PathVariable String statusCode) {
        log.info("Getting experiences for mentor ID: {} with status: {}", mentorId, statusCode);
        List<MentorExperienceResponse> response = mentorExperienceService.getExperiencesByMentorAndStatus(mentorId, statusCode);
        BaseResponse<List<MentorExperienceResponse>> api = BaseResponse.<List<MentorExperienceResponse>>builder()
                .respCode("0")
                .description("Mentor experiences retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @GetMapping("/approved")
    public ResponseEntity<BaseResponse<List<MentorExperienceResponse>>> getAllApprovedExperiences() {
        log.info("Getting all approved mentor experiences (public)");
        List<MentorExperienceResponse> response = mentorExperienceService.getAllApprovedExperiences();
        BaseResponse<List<MentorExperienceResponse>> api = BaseResponse.<List<MentorExperienceResponse>>builder()
                .respCode("0")
                .description("Approved mentor experiences retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @GetMapping("/mentor/{mentorId}/approved")
    public ResponseEntity<BaseResponse<List<MentorExperienceResponse>>> getApprovedExperiencesByMentorId(@PathVariable Long mentorId) {
        log.info("Getting approved mentor experiences for mentor ID: {}", mentorId);
        List<MentorExperienceResponse> response = mentorExperienceService.getApprovedByMentorId(mentorId);
        BaseResponse<List<MentorExperienceResponse>> api = BaseResponse.<List<MentorExperienceResponse>>builder()
                .respCode("0")
                .description("Approved mentor experiences for mentor " + mentorId + " retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    // Admin actions
    @PutMapping("/admin/{experienceId}/approve")
    public ResponseEntity<BaseResponse<MentorExperienceResponse>> approveExperience(@PathVariable Long experienceId) {
        log.info("Approving experience ID: {}", experienceId);
        MentorExperienceResponse response = mentorExperienceService.approveExperience(experienceId);
        BaseResponse<MentorExperienceResponse> api = BaseResponse.<MentorExperienceResponse>builder()
                .respCode("0")
                .description("Experience approved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @PutMapping("/admin/{experienceId}/reject")
    public ResponseEntity<BaseResponse<MentorExperienceResponse>> rejectExperience(@PathVariable Long experienceId) {
        log.info("Rejecting experience ID: {}", experienceId);
        MentorExperienceResponse response = mentorExperienceService.rejectExperience(experienceId);
        BaseResponse<MentorExperienceResponse> api = BaseResponse.<MentorExperienceResponse>builder()
                .respCode("0")
                .description("Experience rejected successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }
}

