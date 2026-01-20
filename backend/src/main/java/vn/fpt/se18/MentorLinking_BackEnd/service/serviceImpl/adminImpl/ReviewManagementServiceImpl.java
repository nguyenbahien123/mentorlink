package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl.adminImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.review.ReviewFilterRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.ReviewDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.ReviewStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Booking;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Review;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.repository.ReviewRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.ReviewManagementService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewManagementServiceImpl implements ReviewManagementService {

    private final ReviewRepository reviewRepository;

    @Override
    public BaseResponse<PageResponse<ReviewDetailResponse>> getAllReviews(BaseRequest<ReviewFilterRequest> request) {
        try {
            ReviewFilterRequest data = request.getData();
            
            Pageable pageable = PageRequest.of(
                    data.getPage() - 1,
                    data.getSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );

            // Parse date range
            LocalDateTime dateFrom = null;
            LocalDateTime dateTo = null;
            
            if (data.getDateFrom() != null && !data.getDateFrom().isEmpty()) {
                try {
                    dateFrom = LocalDate.parse(data.getDateFrom()).atStartOfDay();
                } catch (Exception e) {
                    log.warn("Invalid dateFrom format: {}", data.getDateFrom());
                }
            }
            
            if (data.getDateTo() != null && !data.getDateTo().isEmpty()) {
                try {
                    dateTo = LocalDate.parse(data.getDateTo()).atTime(LocalTime.MAX);
                } catch (Exception e) {
                    log.warn("Invalid dateTo format: {}", data.getDateTo());
                }
            }

            Page<Review> reviewPage = reviewRepository.findAllWithCondition(
                    data.getKeySearch(),
                    data.getRating(),
                    data.getStatus(),
                    dateFrom,
                    dateTo,
                    pageable
            );

            List<ReviewDetailResponse> reviewResponses = reviewPage.getContent().stream()
                    .map(this::convertToDetailResponse)
                    .collect(Collectors.toList());

            PageResponse<ReviewDetailResponse> pageResponse = PageResponse.<ReviewDetailResponse>builder()
                    .content(reviewResponses)
                    .totalElements(reviewPage.getTotalElements())
                    .totalPages(reviewPage.getTotalPages())
                    .currentPage(data.getPage())
                    .pageSize(data.getSize())
                    .build();

            return BaseResponse.<PageResponse<ReviewDetailResponse>>builder()
                    .respCode("0")
                    .description("Success")
                    .data(pageResponse)
                    .build();
        } catch (Exception e) {
            log.error("Error getting reviews: ", e);
            return BaseResponse.<PageResponse<ReviewDetailResponse>>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public BaseResponse<ReviewDetailResponse> getReviewById(Long id) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findById(id);
            if (reviewOpt.isEmpty()) {
                return BaseResponse.<ReviewDetailResponse>builder()
                        .respCode("1")
                        .description("Review not found")
                        .build();
            }

            return BaseResponse.<ReviewDetailResponse>builder()
                    .respCode("0")
                    .description("Success")
                    .data(convertToDetailResponse(reviewOpt.get()))
                    .build();
        } catch (Exception e) {
            log.error("Error getting review by id: ", e);
            return BaseResponse.<ReviewDetailResponse>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> publishReview(Long id) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findById(id);
            if (reviewOpt.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Review not found")
                        .build();
            }

            Review review = reviewOpt.get();
            review.setIsPublished(true);
            review.setUpdatedAt(LocalDateTime.now());
            reviewRepository.save(review);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Review published successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error publishing review: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> unpublishReview(Long id) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findById(id);
            if (reviewOpt.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Review not found")
                        .build();
            }

            Review review = reviewOpt.get();
            review.setIsPublished(false);
            review.setUpdatedAt(LocalDateTime.now());
            reviewRepository.save(review);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Review unpublished successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error unpublishing review: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> deleteReview(Long id) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findById(id);
            if (reviewOpt.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Review not found")
                        .build();
            }

            reviewRepository.deleteById(id);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Review deleted successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error deleting review: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> updateModerationNote(Long id, String note) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findById(id);
            if (reviewOpt.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Review not found")
                        .build();
            }

            Review review = reviewOpt.get();
            // Note: Cần thêm field moderationNote vào entity Review nếu muốn lưu
            review.setUpdatedAt(LocalDateTime.now());
            reviewRepository.save(review);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Moderation note updated successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error updating moderation note: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> bulkPublish(Long[] ids) {
        try {
            List<Review> reviews = reviewRepository.findAllById(Arrays.asList(ids));
            
            reviews.forEach(review -> {
                review.setIsPublished(true);
                review.setUpdatedAt(LocalDateTime.now());
            });
            
            reviewRepository.saveAll(reviews);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description(reviews.size() + " reviews published successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error bulk publishing reviews: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> bulkDelete(Long[] ids) {
        try {
            reviewRepository.deleteAllById(Arrays.asList(ids));

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description(ids.length + " reviews deleted successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error bulk deleting reviews: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public BaseResponse<ReviewStatisticsResponse> getStatistics() {
        try {
            long totalReviews = reviewRepository.count();
            long publishedReviews = reviewRepository.countByIsPublished(true);
            long pendingReviews = reviewRepository.countByIsPublished(false);
            
            Double averageRating = reviewRepository.calculateAverageRating();
            
            long fiveStarCount = reviewRepository.countByRating(5);
            long fourStarCount = reviewRepository.countByRating(4);
            long threeStarCount = reviewRepository.countByRating(3);
            long twoStarCount = reviewRepository.countByRating(2);
            long oneStarCount = reviewRepository.countByRating(1);

            ReviewStatisticsResponse statistics = ReviewStatisticsResponse.builder()
                    .totalReviews(totalReviews)
                    .publishedReviews(publishedReviews)
                    .pendingReviews(pendingReviews)
                    .reportedReviews(0L) // TODO: Implement if needed
                    .averageRating(averageRating != null ? averageRating : 0.0)
                    .fiveStarCount(fiveStarCount)
                    .fourStarCount(fourStarCount)
                    .threeStarCount(threeStarCount)
                    .twoStarCount(twoStarCount)
                    .oneStarCount(oneStarCount)
                    .build();

            return BaseResponse.<ReviewStatisticsResponse>builder()
                    .respCode("0")
                    .description("Success")
                    .data(statistics)
                    .build();
        } catch (Exception e) {
            log.error("Error getting statistics: ", e);
            return BaseResponse.<ReviewStatisticsResponse>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    // Helper methods
    private ReviewDetailResponse convertToDetailResponse(Review review) {
        Booking booking = review.getBooking();
        User customer = booking != null ? booking.getCustomer() : null;
        User mentor = booking != null ? booking.getMentor() : null;

        return ReviewDetailResponse.builder()
                .id(review.getId())
                // Booking info
                .bookingId(booking != null ? booking.getId() : null)
                .service(booking != null && booking.getService() != null ? booking.getService().name() : null)
                // Customer info
                .customerId(customer != null ? customer.getId() : null)
                .customerName(customer != null ? customer.getFullname() : null)
                .customerEmail(customer != null ? customer.getEmail() : null)
                // Mentor info
                .mentorId(mentor != null ? mentor.getId() : null)
                .mentorName(mentor != null ? mentor.getFullname() : null)
                .mentorEmail(mentor != null ? mentor.getEmail() : null)
                // Review content
                .rating(review.getRating())
                .comment(review.getComment())
                // Status
                .isPublished(review.getIsPublished())
                .isReported(false) // TODO: Implement if needed
                .reportReason(null) // TODO: Implement if needed
                .moderationNote(null) // TODO: Add field to entity if needed
                // Timestamps
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
