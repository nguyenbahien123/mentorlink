package vn.fpt.se18.MentorLinking_BackEnd.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Booking;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Review;
import vn.fpt.se18.MentorLinking_BackEnd.entity.ReviewToken;
import vn.fpt.se18.MentorLinking_BackEnd.repository.BookingRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.ReviewRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.ReviewTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/booking/review")
@RequiredArgsConstructor
@Tag(name = "Booking Review Controller", description = "API để xử lý đánh giá buổi học")
public class BookingReviewController {

    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewTokenService reviewTokenService;

    /**
     * DTO nhận từ frontend
     */
    public static class SubmitReviewRequest {
        public String token;        // Token từ email
        public Integer rating;      // 1-5 sao
        public String comment;      // Nội dung đánh giá

        public SubmitReviewRequest() {}

        public SubmitReviewRequest(String token, Integer rating, String comment) {
            this.token = token;
            this.rating = rating;
            this.comment = comment;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public Integer getRating() {
            return rating;
        }

        public void setRating(Integer rating) {
            this.rating = rating;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }
    }

    /**
     * API 1: Xác thực token trước khi người dùng fill form
     * GET /booking/review/validate?token=xxx
     * (Frontend requests /api/booking/review/validate, Vite proxy removes /api)
     */
    @GetMapping("/validate")
    @Operation(summary = "Xác thực token đánh giá")
    public BaseResponse<Object> validateToken(@RequestParam String token) {
        String trimmedToken = token == null ? null : token.trim();
        String decodedToken = null;
        try {
            if (trimmedToken != null) {
                decodedToken = java.net.URLDecoder.decode(trimmedToken, java.nio.charset.StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            log.warn("Failed to URL-decode token, using trimmed value: {}", trimmedToken);
            decodedToken = trimmedToken;
        }

        log.info("🔍 Validating token (trimmed/decoded): {}/{}", trimmedToken, decodedToken == null ? "<null>" : decodedToken.substring(0, Math.min(10, decodedToken.length())));

        // Kiểm tra token có hợp lệ không
        ReviewToken reviewToken = reviewTokenService.validateReviewToken(decodedToken != null ? decodedToken : trimmedToken);
        if (reviewToken == null) {
            log.warn("❌ Token không hợp lệ: queried={}, decoded={}", trimmedToken, decodedToken);
            return BaseResponse.builder()
                    .respCode("1")
                    .description("Token không hợp lệ hoặc đã hết hạn")
                    .build();
        }
        log.info("✅ Token validated successfully. Token={}, BookingId={}, ExpiresAt={}, IsUsed={}", 
                 reviewToken.getToken(), reviewToken.getBookingId(), reviewToken.getExpiresAt(), reviewToken.getIsUsed());

        // Lấy thông tin booking
        Optional<Booking> bookingOpt = bookingRepository.findById(reviewToken.getBookingId());
        if (bookingOpt.isEmpty()) {
            return BaseResponse.builder()
                    .respCode("1")
                    .description("Booking không tồn tại")
                    .build();
        }

        Booking booking = bookingOpt.get();

        // Kiểm tra đã được đánh giá chưa
        boolean alreadyReviewed = reviewRepository.findByBookingId(booking.getId()).isPresent();
        if (alreadyReviewed) {
            return BaseResponse.builder()
                    .respCode("1")
                    .description("Bạn đã đánh giá buổi học này rồi")
                    .build();
        }

        // Return thông tin booking
        return BaseResponse.builder()
                .respCode("0")
                .description("Token hợp lệ")
                .data(new Object() {
                    public Long bookingId = booking.getId();
                    public String mentorName = booking.getMentor() != null ? booking.getMentor().getFullname() : "N/A";
                    public String customerName = booking.getCustomer() != null ? booking.getCustomer().getFullname() : "N/A";
                    public String serviceName = booking.getService() != null ? booking.getService().toString() : "N/A";
                })
                .build();
    }

    /**
     * Debug endpoint (dev) - trả raw token record để debug
     */
    @GetMapping("/debug")
    @Operation(summary = "Debug: get raw review token record")
    public BaseResponse<Object> debugToken(@RequestParam String token) {
        try {
            String trimmed = token == null ? null : token.trim();
            String decoded = null;
            try {
                if (trimmed != null) decoded = java.net.URLDecoder.decode(trimmed, java.nio.charset.StandardCharsets.UTF_8);
            } catch (Exception ignored) {}

            ReviewToken raw = reviewTokenService.findByToken(trimmed);
            ReviewToken rawDecoded = null;
            if (raw == null && decoded != null && !decoded.equals(trimmed)) {
                rawDecoded = reviewTokenService.findByToken(decoded);
            }

            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("queried", trimmed);
            result.put("decoded", decoded);

            if (raw != null) {
                java.util.Map<String, Object> r = new java.util.HashMap<>();
                r.put("token", raw.getToken());
                r.put("email", raw.getEmail());
                r.put("expiresAt", raw.getExpiresAt());
                r.put("isUsed", raw.getIsUsed());
                result.put("raw", r);
            } else {
                result.put("raw", null);
            }

            if (rawDecoded != null) {
                java.util.Map<String, Object> rd = new java.util.HashMap<>();
                rd.put("token", rawDecoded.getToken());
                rd.put("email", rawDecoded.getEmail());
                rd.put("expiresAt", rawDecoded.getExpiresAt());
                rd.put("isUsed", rawDecoded.getIsUsed());
                result.put("rawDecoded", rd);
            } else {
                result.put("rawDecoded", null);
            }

            return BaseResponse.builder()
                    .respCode("0")
                    .description("Debug token lookup")
                    .data(result)
                    .build();
        } catch (Exception e) {
            log.error("Error in debugToken: {}", e.getMessage(), e);
            return BaseResponse.builder().respCode("1").description("Error").build();
        }
    }



    /**
     * API: Lưu đánh giá (với token validation)
     * POST /booking/review/submit
     * (Frontend requests /api/booking/review/submit, Vite proxy removes /api)
     * 
     * Body: {
     *   "requestDateTime": "2026-01-28T...",
     *   "data": {
     *     "token": "uuid-token-here",
     *     "rating": 5,
     *     "comment": "Buổi học rất tuyệt vời!"
     *   }
     * }
     */
    @PostMapping("/submit")
    @Operation(summary = "Gửi đánh giá buổi học")
    public BaseResponse<Void> submitReview(@RequestBody BaseRequest<SubmitReviewRequest> request) {
        try {
            SubmitReviewRequest req = request.getData();
            log.info("📝 Submit review with token");

            // ===== VALIDATE TOKEN =====
            
            if (req.getToken() == null || req.getToken().trim().isEmpty()) {
                log.warn("Missing token");
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Token không hợp lệ")
                        .build();
            }

            // Validate token
            ReviewToken reviewToken = reviewTokenService.validateReviewToken(req.getToken());
            if (reviewToken == null) {
                log.warn("Invalid or expired token");
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Token không hợp lệ hoặc đã hết hạn")
                        .build();
            }

            // ===== VALIDATE RATING & COMMENT =====

            // Kiểm tra rating (1-5)
            if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
                log.warn("Invalid rating: {}", req.getRating());
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Đánh giá phải từ 1 đến 5 sao")
                        .build();
            }

            // Kiểm tra comment
            if (req.getComment() == null || req.getComment().trim().isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Vui lòng nhập nội dung đánh giá")
                        .build();
            }

            String comment = req.getComment().trim();
            if (comment.length() < 10) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Nội dung đánh giá phải có ít nhất 10 ký tự")
                        .build();
            }

            if (comment.length() > 1000) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Nội dung đánh giá không được vượt 1000 ký tự")
                        .build();
            }

            // ===== CHECK BOOKING EXIST =====

            Optional<Booking> bookingOpt = bookingRepository.findById(reviewToken.getBookingId());
            if (bookingOpt.isEmpty()) {
                log.warn("Booking not found: {}", reviewToken.getBookingId());
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Lịch học không tồn tại")
                        .build();
            }

            Booking booking = bookingOpt.get();

            // ===== CHECK DUPLICATE REVIEW =====

            if (reviewRepository.findByBookingId(booking.getId()).isPresent()) {
                log.info("Booking {} already reviewed", booking.getId());
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Bạn đã đánh giá buổi học này rồi")
                        .build();
            }

            // ===== SAVE REVIEW & MARK TOKEN AS USED =====

            Review review = Review.builder()
                    .booking(booking)
                    .rating(req.getRating())
                    .comment(comment)
                    .isPublished(false)  // Chờ admin duyệt
                    .build();

            reviewRepository.save(review);
            log.info("✅ Review saved successfully for booking {}", booking.getId());

            // Đánh dấu token đã sử dụng (dùng giá trị token canonical từ DB)
            reviewTokenService.markTokenAsUsed(reviewToken.getToken());
            log.info("Marked review token as used");

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Cảm ơn bạn đã đánh giá! Đánh giá sẽ được duyệt trước khi công khai.")
                    .build();

        } catch (Exception e) {
            log.error("❌ Error submitting review: {}", e.getMessage(), e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Lỗi khi lưu đánh giá")
                    .build();
        }
    }
}
