package vn.fpt.se18.MentorLinking_BackEnd.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.MentorEarningsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.PaymentHistoryService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/payment-history")
@RequiredArgsConstructor
@Tag(name = "Payment History Controller")
@Slf4j
public class PaymentHistoryController {

    private final PaymentHistoryService paymentHistoryService;
    private final UserRepository userRepository;

    /**
     * Get total earnings for a specific mentor
     * Only returns completed bookings payment sum
     */
    @GetMapping("/mentor/{mentorId}/earnings")
    @Operation(summary = "Lấy tổng tiền kiếm được của mentor từ các booking đã hoàn thành")
    public BaseResponse<MentorEarningsResponse> getMentorEarnings(
            @PathVariable Long mentorId) {
        try {
            log.info("Request to get earnings for mentor ID: {}", mentorId);

            MentorEarningsResponse earnings = paymentHistoryService.getMentorEarnings(mentorId);

            return BaseResponse.<MentorEarningsResponse>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .description("Lấy tổng tiền kiếm được của mentor thành công")
                    .data(earnings)
                    .build();

        } catch (Exception e) {
            log.error("Error getting mentor earnings", e);
            return BaseResponse.<MentorEarningsResponse>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("1")
                    .description(e.getMessage())
                    .build();
        }
    }

    /**
     * Get total earnings for current logged-in mentor
     * Only returns completed bookings payment sum
     */
    @GetMapping("/my-earnings")
    @Operation(summary = "Lấy tổng tiền kiếm được của mentor hiện tại từ các booking đã hoàn thành")
    public BaseResponse<MentorEarningsResponse> getMyEarnings(
            Authentication authentication) {
        try {
            log.info("Request to get earnings for current mentor");

            // Get current user
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new Exception("User không tồn tại"));

            MentorEarningsResponse earnings = paymentHistoryService.getMentorEarnings(user.getId());

            return BaseResponse.<MentorEarningsResponse>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("0")
                    .description("Lấy tổng tiền kiếm được của bạn thành công")
                    .data(earnings)
                    .build();

        } catch (Exception e) {
            log.error("Error getting current mentor earnings", e);
            return BaseResponse.<MentorEarningsResponse>builder()
                    .requestDateTime(LocalDateTime.now().toString())
                    .respCode("1")
                    .description(e.getMessage())
                    .build();
        }
    }
}

