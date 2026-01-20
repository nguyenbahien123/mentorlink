package vn.fpt.se18.MentorLinking_BackEnd.controller.mentor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor.MentorTestRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorTestResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorTestService;

import java.util.List;

@RestController
@RequestMapping("/mentor/tests")
@RequiredArgsConstructor
@Slf4j
public class MentorTestController {

    private final MentorTestService mentorTestService;

    @PostMapping("/{mentorId}")
    public ResponseEntity<BaseResponse<MentorTestResponse>> createMentorTest(
            @PathVariable Long mentorId,
            @RequestParam("testName") String testName,
            @RequestParam("score") String score,
            @RequestParam(value = "scoreImageFile", required = false) MultipartFile scoreImageFile) {
        log.info("Creating mentor test for mentor ID: {}", mentorId);
        
        MentorTestRequest request = MentorTestRequest.builder()
                .testName(testName)
                .score(score)
                .scoreImageFile(scoreImageFile)
                .build();
        
        MentorTestResponse response = mentorTestService.createMentorTest(mentorId, request);
        BaseResponse<MentorTestResponse> api = BaseResponse.<MentorTestResponse>builder()
                .respCode("0")
                .description("Mentor test created and pending approval")
                .data(response)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(api);
    }

    @GetMapping("/{testId}")
    public ResponseEntity<BaseResponse<MentorTestResponse>> getMentorTestById(@PathVariable Long testId) {
        log.info("Getting mentor test by ID: {}", testId);
        MentorTestResponse response = mentorTestService.getMentorTestById(testId);
        BaseResponse<MentorTestResponse> api = BaseResponse.<MentorTestResponse>builder()
                .respCode("0")
                .description("Mentor test retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<BaseResponse<List<MentorTestResponse>>> getMentorTestsByMentorId(@PathVariable Long mentorId) {
        log.info("Getting all mentor tests for mentor ID: {}", mentorId);
        List<MentorTestResponse> response = mentorTestService.getMentorTestsByMentorId(mentorId);
        BaseResponse<List<MentorTestResponse>> api = BaseResponse.<List<MentorTestResponse>>builder()
                .respCode("0")
                .description("Mentor tests retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @GetMapping("/mentor/{mentorId}/paginated")
    public ResponseEntity<BaseResponse<Page<MentorTestResponse>>> getMentorTestsPaginated(
            @PathVariable Long mentorId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Getting mentor tests paginated for mentor ID: {}, page: {}, size: {}", mentorId, page, size);
        Page<MentorTestResponse> response = mentorTestService.getMentorTestsPaginated(mentorId, page, size);
        BaseResponse<Page<MentorTestResponse>> api = BaseResponse.<Page<MentorTestResponse>>builder()
                .respCode("0")
                .description("Mentor tests retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @PutMapping("/{testId}/mentor/{mentorId}")
    public ResponseEntity<BaseResponse<MentorTestResponse>> updateMentorTest(
            @PathVariable Long testId,
            @PathVariable Long mentorId,
            @RequestParam("testName") String testName,
            @RequestParam("score") String score,
            @RequestParam(value = "scoreImageFile", required = false) MultipartFile scoreImageFile) {
        log.info("Updating mentor test ID: {} for mentor ID: {}", testId, mentorId);
        
        MentorTestRequest request = MentorTestRequest.builder()
                .testName(testName)
                .score(score)
                .scoreImageFile(scoreImageFile)
                .build();
        
        MentorTestResponse response = mentorTestService.updateMentorTest(testId, mentorId, request);
        BaseResponse<MentorTestResponse> api = BaseResponse.<MentorTestResponse>builder()
                .respCode("0")
                .description("Mentor test updated and pending approval")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @DeleteMapping("/{testId}/mentor/{mentorId}")
    public ResponseEntity<BaseResponse<Void>> deleteMentorTest(
            @PathVariable Long testId,
            @PathVariable Long mentorId) {
        log.info("Deleting mentor test ID: {} for mentor ID: {}", testId, mentorId);
        mentorTestService.deleteMentorTest(testId, mentorId);
        BaseResponse<Void> api = BaseResponse.<Void>builder()
                .respCode("0")
                .description("Mentor test deleted successfully")
                .build();
        return ResponseEntity.ok(api);
    }

    @GetMapping("/mentor/{mentorId}/status/{statusCode}")
    public ResponseEntity<BaseResponse<List<MentorTestResponse>>> getTestsByMentorAndStatus(
            @PathVariable Long mentorId,
            @PathVariable String statusCode) {
        log.info("Getting tests for mentor ID: {} with status: {}", mentorId, statusCode);
        List<MentorTestResponse> response = mentorTestService.getTestsByMentorAndStatus(mentorId, statusCode);
        BaseResponse<List<MentorTestResponse>> api = BaseResponse.<List<MentorTestResponse>>builder()
                .respCode("0")
                .description("Mentor tests retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @GetMapping("/approved")
    public ResponseEntity<BaseResponse<List<MentorTestResponse>>> getAllApprovedTests() {
        log.info("Getting all approved mentor tests (public)");
        List<MentorTestResponse> response = mentorTestService.getAllApprovedTests();
        BaseResponse<List<MentorTestResponse>> api = BaseResponse.<List<MentorTestResponse>>builder()
                .respCode("0")
                .description("Approved mentor tests retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @GetMapping("/mentor/{mentorId}/approved")
    public ResponseEntity<BaseResponse<List<MentorTestResponse>>> getApprovedTestsByMentorId(@PathVariable Long mentorId) {
        log.info("Getting approved mentor tests for mentor ID: {}", mentorId);
        List<MentorTestResponse> response = mentorTestService.getTestsByMentorAndStatus(mentorId, "APPROVED");
        BaseResponse<List<MentorTestResponse>> api = BaseResponse.<List<MentorTestResponse>>builder()
                .respCode("0")
                .description("Approved mentor tests for mentor " + mentorId + " retrieved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    // Admin actions
    @PutMapping("/admin/{testId}/approve")
    public ResponseEntity<BaseResponse<MentorTestResponse>> approveTest(@PathVariable Long testId) {
        log.info("Approving test ID: {}", testId);
        MentorTestResponse response = mentorTestService.approveTest(testId);
        BaseResponse<MentorTestResponse> api = BaseResponse.<MentorTestResponse>builder()
                .respCode("0")
                .description("Test approved successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }

    @PutMapping("/admin/{testId}/reject")
    public ResponseEntity<BaseResponse<MentorTestResponse>> rejectTest(@PathVariable Long testId) {
        log.info("Rejecting test ID: {}", testId);
        MentorTestResponse response = mentorTestService.rejectTest(testId);
        BaseResponse<MentorTestResponse> api = BaseResponse.<MentorTestResponse>builder()
                .respCode("0")
                .description("Test rejected successfully")
                .data(response)
                .build();
        return ResponseEntity.ok(api);
    }
}

