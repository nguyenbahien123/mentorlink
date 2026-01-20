package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.review.ReviewFilterRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.ReviewDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.ReviewStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.ReviewManagementService;

@Slf4j
@RestController
@RequestMapping("/admin/reviews")
@RequiredArgsConstructor
@Tag(name = "Admin - Review Management", description = "APIs for managing reviews")
@PreAuthorize("hasRole('ADMIN')")
public class ReviewManagementController {

    private final ReviewManagementService reviewManagementService;

    @PostMapping("/list")
    @Operation(summary = "Get all reviews with filters and pagination")
    public ResponseEntity<BaseResponse<PageResponse<ReviewDetailResponse>>> getAllReviews(
            @RequestBody BaseRequest<ReviewFilterRequest> request) {
        log.info("Get all reviews with filters: {}", request.getData());
        return ResponseEntity.ok(reviewManagementService.getAllReviews(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get review by ID")
    public ResponseEntity<BaseResponse<ReviewDetailResponse>> getReviewById(@PathVariable Long id) {
        log.info("Get review by id: {}", id);
        return ResponseEntity.ok(reviewManagementService.getReviewById(id));
    }

    @PutMapping("/{id}/publish")
    @Operation(summary = "Publish a review")
    public ResponseEntity<BaseResponse<Void>> publishReview(@PathVariable Long id) {
        log.info("Publish review: {}", id);
        return ResponseEntity.ok(reviewManagementService.publishReview(id));
    }

    @PutMapping("/{id}/unpublish")
    @Operation(summary = "Unpublish a review")
    public ResponseEntity<BaseResponse<Void>> unpublishReview(@PathVariable Long id) {
        log.info("Unpublish review: {}", id);
        return ResponseEntity.ok(reviewManagementService.unpublishReview(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a review")
    public ResponseEntity<BaseResponse<Void>> deleteReview(@PathVariable Long id) {
        log.info("Delete review: {}", id);
        return ResponseEntity.ok(reviewManagementService.deleteReview(id));
    }

    @PutMapping("/{id}/moderation-note")
    @Operation(summary = "Update moderation note")
    public ResponseEntity<BaseResponse<Void>> updateModerationNote(
            @PathVariable Long id,
            @RequestParam String note) {
        log.info("Update moderation note for review: {} with note: {}", id, note);
        return ResponseEntity.ok(reviewManagementService.updateModerationNote(id, note));
    }

    @PutMapping("/bulk-publish")
    @Operation(summary = "Bulk publish reviews")
    public ResponseEntity<BaseResponse<Void>> bulkPublish(@RequestBody Long[] ids) {
        log.info("Bulk publish reviews: {}", (Object) ids);
        return ResponseEntity.ok(reviewManagementService.bulkPublish(ids));
    }

    @DeleteMapping("/bulk-delete")
    @Operation(summary = "Bulk delete reviews")
    public ResponseEntity<BaseResponse<Void>> bulkDelete(@RequestBody Long[] ids) {
        log.info("Bulk delete reviews: {}", (Object) ids);
        return ResponseEntity.ok(reviewManagementService.bulkDelete(ids));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get review statistics")
    public ResponseEntity<BaseResponse<ReviewStatisticsResponse>> getStatistics() {
        log.info("Get review statistics");
        return ResponseEntity.ok(reviewManagementService.getStatistics());
    }
}
