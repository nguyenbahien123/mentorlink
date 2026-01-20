package vn.fpt.se18.MentorLinking_BackEnd.controller;

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
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.BookingService;
import vn.fpt.se18.MentorLinking_BackEnd.service.VNPayService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking Controller")
@Slf4j
public class BookingController {

    private final BookingService bookingService;
    private final VNPayService vnPayService;
    private final UserRepository userRepository;

    /**
     * Create a booking and get VNPay payment URL
     */
    @PostMapping("/create-payment")
    @Operation(summary = "Create booking and get VNPay payment URL")
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

            // Create booking and get payment URL
            String paymentUrl = bookingService.createBookingAndGetPaymentUrl(
                    user.getId(),
                    request,
                    httpRequest);

            return BaseResponse.<String>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .description("Tạo đơn đặt lịch thành công")
                    .data(paymentUrl)
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
     * VNPay return URL - called by frontend after payment
     */
    @GetMapping("/vnpay-return")
    @Operation(summary = "VNPay return endpoint")
    public ResponseEntity<?> vnpayReturn(@RequestParam Map<String, String> params) {
        try {
            log.info("VNPay return callback received");

            // Verify payment signature
            boolean isValid = vnPayService.verifyPaymentResponse(params);
            if (!isValid) {
                log.warn("Invalid VNPay signature");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Chữ ký thanh toán không hợp lệ");
            }

            // Get response code
            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String vnp_TxnRef = params.get("vnp_TxnRef");
            String vnp_TransactionNo = params.get("vnp_TransactionNo");

            // Handle payment callback
            Long mentorId = bookingService.handlePaymentCallback(vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo);

            // Redirect to frontend with success/failure status
            if ("00".equals(vnp_ResponseCode)) {
                log.info("Payment successful for booking: {}", vnp_TxnRef);
                // Redirect to mentor detail page with success notification
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header(HttpHeaders.LOCATION, "http://localhost:5173/mentors/" + mentorId + "?bookingSuccess=true")
                        .build();
            } else {
                log.warn("Payment failed or cancelled with code: {}", vnp_ResponseCode);
                // Redirect to find-mentor page with bookingSuccess=false
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header(HttpHeaders.LOCATION, "http://localhost:5173/find-mentor?bookingSuccess=false")
                        .build();
            }

        } catch (Exception e) {
            log.error("Error processing VNPay return", e);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, "http://localhost:5173/find-mentor?bookingSuccess=false")
                    .build();
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
