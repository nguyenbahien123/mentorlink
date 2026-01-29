package vn.fpt.se18.MentorLinking_BackEnd.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.CreateBookingRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BookingResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PaymentDataResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.BookingService;
import vn.fpt.se18.MentorLinking_BackEnd.service.PayOsService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking Controller")
@Slf4j
public class BookingController {

    private final BookingService bookingService;
    private final PayOsService payOsService;
    private final UserRepository userRepository;

    /**
     * Create a booking and get PayOS checkout URL for redirect
     */
    @PostMapping("/create-payment")
    @Operation(summary = "Create booking and get PayOS checkout URL")
    public BaseResponse<String> createBookingAndGetPaymentUrl(
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        try {
            log.info("Request to create booking with schedule: {}", request.getScheduleId());

            // Get current user
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            // Create booking and get PayOS checkout URL for redirect
            String checkoutUrl = bookingService.createBookingAndGetPaymentUrl(
                    user.getId(),
                    request,
                    httpRequest);

            return BaseResponse.<String>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .description("Tạo đơn đặt lịch thành công")
                    .data(checkoutUrl)
                    .build();

        } catch (Exception e) {
            log.error("Error creating booking", e);
            return BaseResponse.<String>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("1")
                    .description(e.getMessage())
                    .build();
        }
    }

    /**
     * PayOS return URL - called by PayOS after user finishes payment
     */
    @GetMapping("/payos-return")
    @Operation(summary = "PayOS return endpoint")
    public ResponseEntity<?> payosReturn(@RequestParam Map<String, String> params) {
        try {
            log.info("PayOS return callback received: {}", params.keySet());

            String orderCodeStr = params.getOrDefault("orderCode", params.get("id"));
            Long orderCode = orderCodeStr != null ? Long.parseLong(orderCodeStr) : null;

            boolean isSuccess = orderCode != null && payOsService.isPaymentSucceeded(orderCode);
            String transactionCode = params.getOrDefault("reference", params.get("paymentLinkId"));

            Long mentorId = bookingService.handlePaymentCallback(orderCode, isSuccess, transactionCode);

            if (isSuccess) {
                log.info("Payment successful for booking: {}", orderCode);
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header(HttpHeaders.LOCATION, "http://localhost:3000/mentors/" + mentorId + "?bookingSuccess=true")
                        .build();
            }

            log.warn("Payment failed or cancelled for booking: {}", orderCode);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, "http://localhost:3000/find-mentor?bookingSuccess=false")
                    .build();

        } catch (Exception e) {
            log.error("Error processing PayOS return", e);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, "http://localhost:3000/find-mentor?bookingSuccess=false")
                    .build();
        }
    }

    /**
     * PayOS webhook - server-to-server notification
     */
    @PostMapping("/payos/webhook")
    @Operation(summary = "PayOS webhook endpoint")
    public ResponseEntity<String> payosWebhook(@RequestBody Map<String, Object> payload) {
        try {
            log.info("PayOS webhook received");

            boolean valid = payOsService.verifyWebhookSignature(payload);
            if (!valid) {
                log.warn("Invalid PayOS webhook signature");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("invalid signature");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            if (data == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("missing data");
            }

            Long orderCode = data.get("orderCode") != null ? Long.parseLong(String.valueOf(data.get("orderCode"))) : null;
            boolean success = Boolean.parseBoolean(String.valueOf(payload.getOrDefault("success", false)))
                    || "00".equals(String.valueOf(data.get("code")));
            String transactionCode = data.get("reference") != null
                    ? String.valueOf(data.get("reference"))
                    : String.valueOf(data.getOrDefault("paymentLinkId", ""));

            bookingService.handlePaymentCallback(orderCode, success, transactionCode);
            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            log.error("Error processing PayOS webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("error");
        }
    }

    /**
     * Clean up unpaid bookings (manual trigger or can be scheduled)
     */
    @PostMapping("/cleanup-unpaid")
    @Operation(summary = "Clean up unpaid bookings older than 15 minutes")
    public BaseResponse<String> cleanupUnpaidBookings() {
        try {
            log.info("Manual cleanup of unpaid bookings triggered");
            bookingService.cleanupUnpaidBookings();
            
            return BaseResponse.<String>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .description("Dọn dẹp đơn đặt lịch chưa thanh toán thành công")
                    .build();
        } catch (Exception e) {
            log.error("Error cleaning up unpaid bookings", e);
            return BaseResponse.<String>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("1")
                    .description("Lỗi khi dọn dẹp: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get bookings for the authenticated user filtered by paymentProcess values
     */
    @GetMapping("/mine")
    @Operation(summary = "Get bookings of current user with paymentProcess in (COMPLETED, REFUNDED, WAIT_REFUND)")
    public BaseResponse<List<BookingResponse>> getMyBookings(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            List<BookingResponse> bookings = bookingService.getBookingsByCustomerAndPaymentProcesses(user.getId());

            return BaseResponse.<List<BookingResponse>>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .description("Lấy danh sách booking thành công")
                    .data(bookings)
                    .build();
        } catch (Exception e) {
            log.error("Error getting user bookings", e);
            return BaseResponse.<List<BookingResponse>>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("1")
                    .description(e.getMessage())
                    .build();
        }
    }

    /**
     * Check payment status for a booking (polling from frontend)
     */
    @GetMapping("/check-payment-status/{bookingId}")
    @Operation(summary = "Check if payment has been completed for a booking")
    public BaseResponse<Map<String, Boolean>> checkPaymentStatus(@PathVariable Long bookingId) {
        try {
            Map<String, Boolean> result = new HashMap<>();
            result.put("paymentCompleted", false);
            
            return BaseResponse.<Map<String, Boolean>>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .data(result)
                    .build();
        } catch (Exception e) {
            log.error("Error checking payment status for booking {}", bookingId, e);
            return BaseResponse.<Map<String, Boolean>>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("1")
                    .description(e.getMessage())
                    .build();
        }
    }

    /**
     * Cancel a booking by the authenticated customer (only if rules satisfied)
     */
    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking (customer only). Must be at least 3 hours before earliest time slot and paymentProcess must be COMPLETED")
    public BaseResponse<String> cancelBooking(@PathVariable("id") Long bookingId, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            bookingService.cancelBooking(user.getId(), bookingId);

            return BaseResponse.<String>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .description("Hủy booking thành công")
                    .build();
        } catch (Exception e) {
            log.error("Error cancelling booking {}", bookingId, e);
            return BaseResponse.<String>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("1")
                    .description("Lỗi khi hủy booking: " + e.getMessage())
                    .build();
        }
    }
}
