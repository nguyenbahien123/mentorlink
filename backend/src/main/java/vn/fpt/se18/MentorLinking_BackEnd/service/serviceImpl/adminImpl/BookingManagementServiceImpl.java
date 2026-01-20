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
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.booking.BookingFilterRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.BookingDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.BookingStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.ScheduleDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.*;
import vn.fpt.se18.MentorLinking_BackEnd.repository.BookingRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.ScheduleRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.BookingManagementService;
import vn.fpt.se18.MentorLinking_BackEnd.util.PaymentProcess;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingManagementServiceImpl implements BookingManagementService {

    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;
    private final StatusRepository statusRepository;

    @Override
    public BaseResponse<PageResponse<BookingDetailResponse>> getAllBookings(BaseRequest<BookingFilterRequest> request) {
        try {
            BookingFilterRequest data = request.getData();
            
            Pageable pageable = PageRequest.of(
                    data.getPage() - 1,
                    data.getSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );

            // Parse payment process from string
            PaymentProcess paymentProcess = null;
            if (data.getPaymentStatus() != null && !data.getPaymentStatus().isEmpty()) {
                try {
                    paymentProcess = PaymentProcess.valueOf(data.getPaymentStatus());
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid payment status: {}", data.getPaymentStatus());
                }
            }

            // Parse date
            LocalDate filterDate = null;
            if (data.getDate() != null && !data.getDate().isEmpty()) {
                try {
                    filterDate = LocalDate.parse(data.getDate());
                } catch (Exception e) {
                    log.warn("Invalid date format: {}", data.getDate());
                }
            }

            Page<Booking> bookingPage = bookingRepository.findAllWithCondition(
                    data.getKeySearch(),
                    data.getStatus(),
                    paymentProcess,
                    filterDate,
                    pageable
            );

            List<BookingDetailResponse> bookingResponses = bookingPage.getContent().stream()
                    .map(this::convertToDetailResponse)
                    .collect(Collectors.toList());

            PageResponse<BookingDetailResponse> pageResponse = PageResponse.<BookingDetailResponse>builder()
                    .content(bookingResponses)
                    .totalElements(bookingPage.getTotalElements())
                    .totalPages(bookingPage.getTotalPages())
                    .currentPage(data.getPage())
                    .pageSize(data.getSize())
                    .build();

            return BaseResponse.<PageResponse<BookingDetailResponse>>builder()
                    .respCode("0")
                    .description("Success")
                    .data(pageResponse)
                    .build();
        } catch (Exception e) {
            log.error("Error getting bookings: ", e);
            return BaseResponse.<PageResponse<BookingDetailResponse>>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public BaseResponse<BookingDetailResponse> getBookingById(Long id) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            if (bookingOpt.isEmpty()) {
                return BaseResponse.<BookingDetailResponse>builder()
                        .respCode("1")
                        .description("Booking not found")
                        .build();
            }

            return BaseResponse.<BookingDetailResponse>builder()
                    .respCode("0")
                    .description("Success")
                    .data(convertToDetailResponse(bookingOpt.get()))
                    .build();
        } catch (Exception e) {
            log.error("Error getting booking by id: ", e);
            return BaseResponse.<BookingDetailResponse>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> confirmBooking(Long id) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            if (bookingOpt.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Booking not found")
                        .build();
            }

            Booking booking = bookingOpt.get();
            
            // Update booking status to CONFIRMED
            Optional<Status> confirmedStatus = statusRepository.findByCode("CONFIRMED");
            if (confirmedStatus.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("CONFIRMED status not found")
                        .build();
            }

            booking.setStatus(confirmedStatus.get());
            booking.setUpdatedAt(LocalDateTime.now());
            bookingRepository.save(booking);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Booking confirmed successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error confirming booking: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> cancelBooking(Long id, String reason) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            if (bookingOpt.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Booking not found")
                        .build();
            }

            Booking booking = bookingOpt.get();
            
            // Update booking status to CANCELLED
            Optional<Status> cancelledStatus = statusRepository.findByCode("CANCELLED");
            if (cancelledStatus.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("CANCELLED status not found")
                        .build();
            }

            booking.setStatus(cancelledStatus.get());
            booking.setComment(reason); // Store cancel reason in comment field
            booking.setUpdatedAt(LocalDateTime.now());
            
            // Update schedule to be available again
            Schedule schedule = booking.getSchedule();
            if (schedule != null) {
                schedule.setIsBooked(false);
                scheduleRepository.save(schedule);
            }
            
            bookingRepository.save(booking);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Booking cancelled successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error cancelling booking: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> completeBooking(Long id) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(id);
            if (bookingOpt.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Booking not found")
                        .build();
            }

            Booking booking = bookingOpt.get();
            
            // Update booking status to COMPLETED
            Optional<Status> completedStatus = statusRepository.findByCode("COMPLETED");
            if (completedStatus.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("COMPLETED status not found")
                        .build();
            }

            booking.setStatus(completedStatus.get());
            booking.setPaymentProcess(PaymentProcess.COMPLETED);
            booking.setUpdatedAt(LocalDateTime.now());
            bookingRepository.save(booking);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Booking completed successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error completing booking: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> bulkConfirmBookings(List<Long> bookingIds) {
        try {
            Optional<Status> confirmedStatus = statusRepository.findByCode("CONFIRMED");
            if (confirmedStatus.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("CONFIRMED status not found")
                        .build();
            }

            List<Booking> bookings = bookingRepository.findAllById(bookingIds);
            bookings.forEach(booking -> {
                booking.setStatus(confirmedStatus.get());
                booking.setUpdatedAt(LocalDateTime.now());
            });
            bookingRepository.saveAll(bookings);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Bookings confirmed successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error bulk confirming bookings: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> bulkCancelBookings(List<Long> bookingIds, String reason) {
        try {
            Optional<Status> cancelledStatus = statusRepository.findByCode("CANCELLED");
            if (cancelledStatus.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("CANCELLED status not found")
                        .build();
            }

            List<Booking> bookings = bookingRepository.findAllById(bookingIds);
            bookings.forEach(booking -> {
                booking.setStatus(cancelledStatus.get());
                booking.setComment(reason);
                booking.setUpdatedAt(LocalDateTime.now());
                
                // Update schedule to be available again
                Schedule schedule = booking.getSchedule();
                if (schedule != null) {
                    schedule.setIsBooked(false);
                    scheduleRepository.save(schedule);
                }
            });
            bookingRepository.saveAll(bookings);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Bookings cancelled successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error bulk cancelling bookings: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public BaseResponse<BookingStatisticsResponse> getStatistics() {
        try {
            long pending = bookingRepository.countByStatusCode("PENDING");
            long confirmed = bookingRepository.countByStatusCode("CONFIRMED");
            long completed = bookingRepository.countByStatusCode("COMPLETED");
            long cancelled = bookingRepository.countByStatusCode("CANCELLED");
            long total = bookingRepository.count();
            
            long paymentPending = bookingRepository.countByPaymentProcess(PaymentProcess.PENDING);
            long paymentPaid = bookingRepository.countByPaymentProcess(PaymentProcess.COMPLETED);
            long paymentRefunded = bookingRepository.countByPaymentProcess(PaymentProcess.REFUNDED);
            
            Double totalRevenue = bookingRepository.calculateTotalRevenue();
            Double monthlyRevenue = bookingRepository.calculateMonthlyRevenue();

            BookingStatisticsResponse statistics = BookingStatisticsResponse.builder()
                    .pending(pending)
                    .confirmed(confirmed)
                    .completed(completed)
                    .cancelled(cancelled)
                    .total(total)
                    .paymentPending(paymentPending)
                    .paymentPaid(paymentPaid)
                    .paymentRefunded(paymentRefunded)
                    .totalRevenue(totalRevenue)
                    .monthlyRevenue(monthlyRevenue)
                    .build();

            return BaseResponse.<BookingStatisticsResponse>builder()
                    .respCode("0")
                    .description("Success")
                    .data(statistics)
                    .build();
        } catch (Exception e) {
            log.error("Error getting statistics: ", e);
            return BaseResponse.<BookingStatisticsResponse>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public BaseResponse<PageResponse<ScheduleDetailResponse>> getAllSchedules(BaseRequest<BookingFilterRequest> request) {
        try {
            BookingFilterRequest data = request.getData();
            
            Pageable pageable = PageRequest.of(
                    data.getPage() - 1,
                    data.getSize(),
                    Sort.by(Sort.Direction.DESC, "date")
            );

            Page<Schedule> schedulePage = scheduleRepository.findAll(pageable);

            List<ScheduleDetailResponse> scheduleResponses = schedulePage.getContent().stream()
                    .map(this::convertToScheduleResponse)
                    .collect(Collectors.toList());

            PageResponse<ScheduleDetailResponse> pageResponse = PageResponse.<ScheduleDetailResponse>builder()
                    .content(scheduleResponses)
                    .totalElements(schedulePage.getTotalElements())
                    .totalPages(schedulePage.getTotalPages())
                    .currentPage(data.getPage())
                    .pageSize(data.getSize())
                    .build();

            return BaseResponse.<PageResponse<ScheduleDetailResponse>>builder()
                    .respCode("0")
                    .description("Success")
                    .data(pageResponse)
                    .build();
        } catch (Exception e) {
            log.error("Error getting schedules: ", e);
            return BaseResponse.<PageResponse<ScheduleDetailResponse>>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public BaseResponse<List<ScheduleDetailResponse>> getSchedulesByMentor(Long mentorId) {
        try {
            // This would require a custom query in ScheduleRepository
            // For now, return empty list as placeholder
            return BaseResponse.<List<ScheduleDetailResponse>>builder()
                    .respCode("0")
                    .description("Success")
                    .data(List.of())
                    .build();
        } catch (Exception e) {
            log.error("Error getting schedules by mentor: ", e);
            return BaseResponse.<List<ScheduleDetailResponse>>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    // Helper methods
    
    private BookingDetailResponse convertToDetailResponse(Booking booking) {
        Schedule schedule = booking.getSchedule();
        PaymentHistory payment = booking.getPaymentHistory();
        Review review = booking.getReview();
        
        // Format time slots
        String timeSlotText = "";
        if (schedule != null && schedule.getTimeSlots() != null && !schedule.getTimeSlots().isEmpty()) {
            timeSlotText = schedule.getTimeSlots().stream()
                    .map(ts -> String.format("%02d:00 - %02d:00", ts.getTimeStart(), ts.getTimeEnd()))
                    .collect(Collectors.joining(", "));
        }

        return BookingDetailResponse.builder()
                .id(booking.getId())
                // Mentor info
                .mentorId(booking.getMentor() != null ? booking.getMentor().getId() : null)
                .mentorName(booking.getMentor() != null ? booking.getMentor().getFullname() : null)
                .mentorEmail(booking.getMentor() != null ? booking.getMentor().getEmail() : null)
                // Customer info
                .customerId(booking.getCustomer() != null ? booking.getCustomer().getId() : null)
                .customerName(booking.getCustomer() != null ? booking.getCustomer().getFullname() : null)
                .customerEmail(booking.getCustomer() != null ? booking.getCustomer().getEmail() : null)
                // Schedule info
                .scheduleId(schedule != null ? schedule.getId() : null)
                .date(schedule != null ? schedule.getDate() : null)
                .timeSlot(schedule != null && schedule.getTimeSlots() != null && !schedule.getTimeSlots().isEmpty() 
                        ? schedule.getTimeSlots().iterator().next().getCode() : null)
                .timeSlotText(timeSlotText)
                // Booking info
                .service(booking.getService() != null ? booking.getService().name() : null)
                .description(booking.getDescription())
                .comment(booking.getComment())
                .linkMeeting(booking.getLinkMeeting())
                .isRead(booking.getIsRead())
                // Status
                .status(booking.getStatus() != null ? booking.getStatus().getCode() : null)
                .paymentProcess(booking.getPaymentProcess() != null ? booking.getPaymentProcess().name() : null)
                // Payment info
                .amount(schedule != null ? schedule.getPrice() : null)
                .paymentStatus(payment != null && payment.getStatus() != null ? payment.getStatus().getCode() : null)
                .paymentMethod(payment != null ? payment.getPaymentMethod() : null)
                .paidAt(payment != null ? payment.getCreatedAt() : null)
                // Review info
                .rating(review != null ? review.getRating() : null)
                .reviewComment(review != null ? review.getComment() : null)
                .reviewedAt(review != null ? review.getCreatedAt() : null)
                // Timestamps
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .completedAt(booking.getPaymentProcess() == PaymentProcess.COMPLETED ? booking.getUpdatedAt() : null)
                .cancelledAt(booking.getStatus() != null && "CANCELLED".equals(booking.getStatus().getCode()) 
                        ? booking.getUpdatedAt() : null)
                .cancelReason(booking.getStatus() != null && "CANCELLED".equals(booking.getStatus().getCode()) 
                        ? booking.getComment() : null)
                .build();
    }

    private ScheduleDetailResponse convertToScheduleResponse(Schedule schedule) {
        // Find booking for this schedule
        Booking booking = bookingRepository.findBySchedule_Id(schedule.getId()).stream().findFirst().orElse(null);
        
        List<String> timeSlotCodes = schedule.getTimeSlots() != null 
                ? schedule.getTimeSlots().stream()
                        .map(TimeSlot::getCode)
                        .collect(Collectors.toList())
                : List.of();
        
        String timeSlotText = schedule.getTimeSlots() != null
                ? schedule.getTimeSlots().stream()
                        .map(ts -> String.format("%02d:00 - %02d:00", ts.getTimeStart(), ts.getTimeEnd()))
                        .collect(Collectors.joining(", "))
                : "";

        return ScheduleDetailResponse.builder()
                .id(schedule.getId())
                .mentorId(schedule.getUser() != null ? schedule.getUser().getId() : null)
                .mentorName(schedule.getUser() != null ? schedule.getUser().getFullname() : null)
                .mentorEmail(schedule.getUser() != null ? schedule.getUser().getEmail() : null)
                .date(schedule.getDate())
                .timeSlots(timeSlotCodes)
                .timeSlotText(timeSlotText)
                .price(schedule.getPrice())
                .isBooked(schedule.getIsBooked())
                .bookingId(booking != null ? booking.getId() : null)
                .bookingStatus(booking != null && booking.getStatus() != null ? booking.getStatus().getCode() : null)
                .customerName(booking != null && booking.getCustomer() != null ? booking.getCustomer().getFullname() : null)
                .isCompleted(booking != null && booking.getPaymentProcess() == PaymentProcess.COMPLETED)
                .build();
    }
}
