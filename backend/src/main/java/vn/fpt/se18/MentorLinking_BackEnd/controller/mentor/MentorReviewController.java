package vn.fpt.se18.MentorLinking_BackEnd.controller.mentor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorReviewResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorReviewStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Review;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.service.UserService;
import vn.fpt.se18.MentorLinking_BackEnd.repository.ReviewRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/mentor", "/api/mentor"})
@RequiredArgsConstructor
@Tag(name = "Mentor Review Controller", description = "APIs for mentors to view their published reviews")
@Slf4j
public class MentorReviewController {

    private final ReviewRepository reviewRepository;
    private final UserService userService;

    @Operation(summary = "Get published reviews for current mentor (optional rating filter)")
    @GetMapping("/reviews")
    public BaseResponse<PageResponse<MentorReviewResponse>> getPublishedReviewsForMentor(
            @RequestParam(name = "rating", required = false) Integer rating,
            @RequestParam(name = "page", required = false, defaultValue = "1") Integer page,
            @RequestParam(name = "size", required = false, defaultValue = "10") Integer size
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return BaseResponse.<PageResponse<MentorReviewResponse>>builder()
                    .respCode("1")
                    .description("Unauthorized")
                    .build();
        }

        String email = authentication.getName();
        User mentor = userService.getUserByEmail(email);
        if (mentor == null) {
            return BaseResponse.<PageResponse<MentorReviewResponse>>builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        int pageNum = Math.max(1, page);
        Pageable pageable = PageRequest.of(pageNum - 1, size);

        Page<Review> reviewPage;
        if (rating != null) {
            reviewPage = reviewRepository.findByBooking_Mentor_IdAndIsPublishedTrueAndRating(mentor.getId(), rating, pageable);
        } else {
            reviewPage = reviewRepository.findByBooking_Mentor_IdAndIsPublishedTrue(mentor.getId(), pageable);
        }

        List<MentorReviewResponse> content = reviewPage.getContent().stream().map(r -> {
            var b = r.getBooking();
            return MentorReviewResponse.builder()
                    .id(r.getId())
                    .bookingId(b != null ? b.getId() : null)
                    .rating(r.getRating())
                    .comment(r.getComment())
                    .isPublished(r.getIsPublished())
                    .createdAt(r.getCreatedAt())
                    .customerId(b != null && b.getCustomer() != null ? b.getCustomer().getId() : null)
                    .customerFullname(b != null && b.getCustomer() != null ? b.getCustomer().getFullname() : null)
                    .service(b != null && b.getService() != null ? b.getService().name() : null)
                    .build();
        }).collect(Collectors.toList());

        PageResponse<MentorReviewResponse> pageResponse = PageResponse.<MentorReviewResponse>builder()
                .content(content)
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .currentPage(pageNum)
                .pageSize(size)
                .build();

        return BaseResponse.<PageResponse<MentorReviewResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get published reviews for mentor successfully")
                .data(pageResponse)
                .build();
    }

    @Operation(summary = "Get review statistics for current mentor")
    @GetMapping("/reviews/statistics")
    public BaseResponse<MentorReviewStatisticsResponse> getReviewStatistics() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return BaseResponse.<MentorReviewStatisticsResponse>builder()
                    .respCode("1")
                    .description("Unauthorized")
                    .build();
        }

        String email = authentication.getName();
        User mentor = userService.getUserByEmail(email);
        if (mentor == null) {
            return BaseResponse.<MentorReviewStatisticsResponse>builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        Long mentorId = mentor.getId();
        
        // Count total published reviews
        long totalReviews = reviewRepository.countByBooking_Mentor_IdAndIsPublishedTrue(mentorId);
        
        // Calculate average rating
        Double averageRating = reviewRepository.calculateAverageRatingForMentor(mentorId);
        if (averageRating == null) {
            averageRating = 0.0;
        }
        
        // Calculate rating distribution
        Map<Integer, Long> ratingDistribution = new HashMap<>();
        for (int rating = 1; rating <= 5; rating++) {
            long count = reviewRepository.countByBooking_Mentor_IdAndIsPublishedTrueAndRating(mentorId, rating);
            ratingDistribution.put(rating, count);
        }

        MentorReviewStatisticsResponse statistics = MentorReviewStatisticsResponse.builder()
                .totalReviews(totalReviews)
                .averageRating(Math.round(averageRating * 100.0) / 100.0) // Round to 2 decimal places
                .ratingDistribution(ratingDistribution)
                .build();

        return BaseResponse.<MentorReviewStatisticsResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get review statistics successfully")
                .data(statistics)
                .build();
    }

    @Operation(summary = "Get published reviews for a mentor by id (public admin-style)")
    @GetMapping("/{mentorId}/reviews")
    public BaseResponse<PageResponse<MentorReviewResponse>> getPublishedReviewsForMentorById(
            @PathVariable("mentorId") Long mentorId,
            @RequestParam(name = "rating", required = false) Integer rating,
            @RequestParam(name = "page", required = false, defaultValue = "1") Integer page,
            @RequestParam(name = "size", required = false, defaultValue = "10") Integer size
    ) {
        // Optional: validate mentor exists via userService
        var mentorResp = userService.getUserById(mentorId);
        if (mentorResp == null || !"0".equals(mentorResp.getRespCode())) {
            return BaseResponse.<PageResponse<MentorReviewResponse>>builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        int pageNum = Math.max(1, page);
        Pageable pageable = PageRequest.of(pageNum - 1, size);

        Page<Review> reviewPage;
        if (rating != null) {
            reviewPage = reviewRepository.findByBooking_Mentor_IdAndIsPublishedTrueAndRating(mentorId, rating, pageable);
        } else {
            reviewPage = reviewRepository.findByBooking_Mentor_IdAndIsPublishedTrue(mentorId, pageable);
        }

        List<MentorReviewResponse> content = reviewPage.getContent().stream().map(r -> {
            var b = r.getBooking();
            return MentorReviewResponse.builder()
                    .id(r.getId())
                    .bookingId(b != null ? b.getId() : null)
                    .rating(r.getRating())
                    .comment(r.getComment())
                    .isPublished(r.getIsPublished())
                    .createdAt(r.getCreatedAt())
                    .customerId(b != null && b.getCustomer() != null ? b.getCustomer().getId() : null)
                    .customerFullname(b != null && b.getCustomer() != null ? b.getCustomer().getFullname() : null)
                    .service(b != null && b.getService() != null ? b.getService().name() : null)
                    .build();
        }).collect(Collectors.toList());

        PageResponse<MentorReviewResponse> pageResponse = PageResponse.<MentorReviewResponse>builder()
                .content(content)
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .currentPage(pageNum)
                .pageSize(size)
                .build();

        return BaseResponse.<PageResponse<MentorReviewResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get published reviews for mentor successfully")
                .data(pageResponse)
                .build();
    }

    @Operation(summary = "Get review statistics for a mentor by id")
    @GetMapping("/{mentorId}/reviews/statistics")
    public BaseResponse<MentorReviewStatisticsResponse> getReviewStatisticsById(@PathVariable("mentorId") Long mentorId) {
        var mentorResp = userService.getUserById(mentorId);
        if (mentorResp == null || !"0".equals(mentorResp.getRespCode())) {
            return BaseResponse.<MentorReviewStatisticsResponse>builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        long totalReviews = reviewRepository.countByBooking_Mentor_IdAndIsPublishedTrue(mentorId);
        Double averageRating = reviewRepository.calculateAverageRatingForMentor(mentorId);
        if (averageRating == null) {
            averageRating = 0.0;
        }
        Map<Integer, Long> ratingDistribution = new HashMap<>();
        for (int rating = 1; rating <= 5; rating++) {
            long count = reviewRepository.countByBooking_Mentor_IdAndIsPublishedTrueAndRating(mentorId, rating);
            ratingDistribution.put(rating, count);
        }

        MentorReviewStatisticsResponse statistics = MentorReviewStatisticsResponse.builder()
                .totalReviews(totalReviews)
                .averageRating(Math.round(averageRating * 100.0) / 100.0)
                .ratingDistribution(ratingDistribution)
                .build();

        return BaseResponse.<MentorReviewStatisticsResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get review statistics successfully")
                .data(statistics)
                .build();
    }

    @Operation(summary = "Debug: return current authenticated mentor info")
    @GetMapping("/debug")
    public BaseResponse<Object> debugCurrentMentor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return BaseResponse.builder()
                    .respCode("1")
                    .description("Unauthorized")
                    .build();
        }

        String email = authentication.getName();
        User mentor = userService.getUserByEmail(email);
        if (mentor == null) {
            return BaseResponse.builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        var map = new java.util.HashMap<String, Object>();
        map.put("email", email);
        map.put("mentorId", mentor.getId());
        map.put("roles", authentication.getAuthorities());

        return BaseResponse.builder()
                .requestDateTime(java.time.LocalDateTime.now().toString())
                .respCode("0")
                .description("OK")
                .data(map)
                .build();
    }
}
