package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.booking.BookingFilterRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.BookingDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.BookingStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.ScheduleDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.BookingManagementService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/admin/bookings")
@RequiredArgsConstructor
@Tag(name = "Admin - Booking Management", description = "APIs for managing bookings and schedules")
@PreAuthorize("hasRole('ADMIN')")
public class BookingManagementController {

    private final BookingManagementService bookingManagementService;

    @PostMapping("/list")
    @Operation(summary = "Get all bookings with filters and pagination")
    public ResponseEntity<BaseResponse<PageResponse<BookingDetailResponse>>> getAllBookings(
            @RequestBody BaseRequest<BookingFilterRequest> request) {
        log.info("Get all bookings with filters: {}", request.getData());
        return ResponseEntity.ok(bookingManagementService.getAllBookings(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<BaseResponse<BookingDetailResponse>> getBookingById(@PathVariable Long id) {
        log.info("Get booking by id: {}", id);
        return ResponseEntity.ok(bookingManagementService.getBookingById(id));
    }

    @PutMapping("/{id}/confirm")
    @Operation(summary = "Confirm a booking")
    public ResponseEntity<BaseResponse<Void>> confirmBooking(@PathVariable Long id) {
        log.info("Confirm booking: {}", id);
        return ResponseEntity.ok(bookingManagementService.confirmBooking(id));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking")
    public ResponseEntity<BaseResponse<Void>> cancelBooking(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        log.info("Cancel booking: {} with reason: {}", id, reason);
        return ResponseEntity.ok(bookingManagementService.cancelBooking(id, reason));
    }

    @PutMapping("/{id}/complete")
    @Operation(summary = "Mark booking as completed")
    public ResponseEntity<BaseResponse<Void>> completeBooking(@PathVariable Long id) {
        log.info("Complete booking: {}", id);
        return ResponseEntity.ok(bookingManagementService.completeBooking(id));
    }

    @PutMapping("/bulk-confirm")
    @Operation(summary = "Confirm multiple bookings")
    public ResponseEntity<BaseResponse<Void>> bulkConfirmBookings(@RequestBody List<Long> bookingIds) {
        log.info("Bulk confirm bookings: {}", bookingIds);
        return ResponseEntity.ok(bookingManagementService.bulkConfirmBookings(bookingIds));
    }

    @PutMapping("/bulk-cancel")
    @Operation(summary = "Cancel multiple bookings")
    public ResponseEntity<BaseResponse<Void>> bulkCancelBookings(
            @RequestBody List<Long> bookingIds,
            @RequestParam(required = false) String reason) {
        log.info("Bulk cancel bookings: {} with reason: {}", bookingIds, reason);
        return ResponseEntity.ok(bookingManagementService.bulkCancelBookings(bookingIds, reason));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get booking statistics")
    public ResponseEntity<BaseResponse<BookingStatisticsResponse>> getStatistics() {
        log.info("Get booking statistics");
        return ResponseEntity.ok(bookingManagementService.getStatistics());
    }

    @PostMapping("/schedules/list")
    @Operation(summary = "Get all schedules with pagination")
    public ResponseEntity<BaseResponse<PageResponse<ScheduleDetailResponse>>> getAllSchedules(
            @RequestBody BaseRequest<BookingFilterRequest> request) {
        log.info("Get all schedules");
        return ResponseEntity.ok(bookingManagementService.getAllSchedules(request));
    }

    @GetMapping("/schedules/mentor/{mentorId}")
    @Operation(summary = "Get schedules by mentor ID")
    public ResponseEntity<BaseResponse<List<ScheduleDetailResponse>>> getSchedulesByMentor(
            @PathVariable Long mentorId) {
        log.info("Get schedules by mentor: {}", mentorId);
        return ResponseEntity.ok(bookingManagementService.getSchedulesByMentor(mentorId));
    }
}
