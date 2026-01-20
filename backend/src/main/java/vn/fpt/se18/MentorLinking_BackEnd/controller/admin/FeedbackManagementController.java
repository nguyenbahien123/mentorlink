package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.feedback.FeedbackFilterRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.feedback.FeedbackResponseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.FeedbackDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.FeedbackStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.FeedbackService;

import java.util.List;

@Slf4j
@Validated
@RestController
@RequestMapping("/admin/feedback-management")
@Tag(name = "Feedback Management Controller")
@RequiredArgsConstructor
public class FeedbackManagementController {

    private final FeedbackService feedbackService;

    @PostMapping("/get-all-feedbacks")
    @Operation(summary = "Get all feedbacks with filters and pagination")
    public BaseResponse<PageResponse<FeedbackDetailResponse>> getAllFeedbacks(
            @Valid @RequestBody BaseRequest<FeedbackFilterRequest> request) {
        return feedbackService.getAllFeedbacks(request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get feedback details by ID")
    public BaseResponse<FeedbackDetailResponse> getFeedbackById(@PathVariable Long id) {
        return feedbackService.getFeedbackById(id);
    }

    @PutMapping("/{id}/respond")
    @Operation(summary = "Respond to feedback")
    public BaseResponse<Void> respondToFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackResponseRequest request) {
        return feedbackService.respondToFeedback(id, request);
    }

    @PutMapping("/{id}/mark-in-progress")
    @Operation(summary = "Mark feedback as in progress")
    public BaseResponse<Void> markInProgress(@PathVariable Long id) {
        return feedbackService.markInProgress(id);
    }

    @PutMapping("/{id}/mark-resolved")
    @Operation(summary = "Mark feedback as resolved")
    public BaseResponse<Void> markResolved(@PathVariable Long id) {
        return feedbackService.markResolved(id);
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Reject feedback")
    public BaseResponse<Void> rejectFeedback(@PathVariable Long id) {
        return feedbackService.rejectFeedback(id);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete feedback")
    public BaseResponse<Void> deleteFeedback(@PathVariable Long id) {
        return feedbackService.deleteFeedback(id);
    }

    @PutMapping("/bulk-resolve")
    @Operation(summary = "Bulk resolve feedbacks")
    public BaseResponse<Void> bulkResolveFeedbacks(@RequestBody List<Long> feedbackIds) {
        return feedbackService.bulkResolveFeedbacks(feedbackIds);
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get feedback statistics")
    public BaseResponse<FeedbackStatisticsResponse> getStatistics() {
        return feedbackService.getStatistics();
    }
}
