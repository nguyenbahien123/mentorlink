package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.CreateBookingRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BookingResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.ScheduleResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.TimeSlotResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.*;
import vn.fpt.se18.MentorLinking_BackEnd.repository.*;
import vn.fpt.se18.MentorLinking_BackEnd.service.BookingService;
import vn.fpt.se18.MentorLinking_BackEnd.service.EmailService;
import vn.fpt.se18.MentorLinking_BackEnd.service.VNPayService;
import vn.fpt.se18.MentorLinking_BackEnd.util.PaymentProcess;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final StatusRepository statusRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;
    private final HistoryRepository historyRepository;
    private final VNPayService vnPayService;
    private final EmailService emailService;

    private List<String> googlemeet_link = List.of(
        "https://meet.google.com/cpg-xvbr-ete",
        "https://meet.google.com/uny-zuen-quq",
        "https://meet.google.com/jhy-gmsp-cbp",
        "https://meet.google.com/rrh-qrnm-ier",
        "https://meet.google.com/dyd-zeqw-yfa",
        "https://meet.google.com/hgy-viac-dic",
        "https://meet.google.com/axw-fkiz-bca",
        "https://meet.google.com/xsf-wdyg-qjc"
    );

    @Override
    @Transactional
    public String createBookingAndGetPaymentUrl(Long customerId, CreateBookingRequest request,
            HttpServletRequest httpRequest) throws Exception {
        log.info("Creating booking for customer: {}, schedule: {}", customerId, request.getScheduleId());

        // Get customer
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer không tồn tại"));

        // Get schedule
        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new RuntimeException("Schedule không tồn tại"));

        // Check if schedule already has a COMPLETED booking (already booked by someone)
        boolean hasCompletedBooking = bookingRepository.existsBySchedule_IdAndPaymentProcess(
                schedule.getId(),
                PaymentProcess.COMPLETED);

        if (hasCompletedBooking) {
            throw new RuntimeException("Lịch này đã được đặt bởi người khác");
        }


        // Enforce booking rule: cannot create a booking if the earliest timeslot
        // of the schedule starts within 3 hours from now.
        if (schedule.getTimeSlots() == null || schedule.getTimeSlots().isEmpty()) {
            throw new RuntimeException("Schedule chưa có time slot để xác định thời gian đặt");
        }

        int earliestHour = schedule.getTimeSlots().stream()
                .map(TimeSlot::getTimeStart)
                .min(Comparator.naturalOrder())
                .orElseThrow(() -> new RuntimeException("Không thể xác định time slot"));

        LocalDateTime slotStartDateTime = schedule.getDate().atTime(LocalTime.of(earliestHour, 0));
        LocalDateTime now = LocalDateTime.now();

        // If earliest start is less than 3 hours from now, reject booking
        if (slotStartDateTime.isBefore(now.plusHours(3))) {
            throw new RuntimeException("Không thể đặt lịch trong vòng 3 giờ trước khi buổi học bắt đầu");
        }

        // Get mentor from schedule
        User mentor = schedule.getUser();

        // Get PENDING status
        Status pendingStatus = statusRepository.findByCode("PENDING")
                .orElseThrow(() -> new RuntimeException("Status PENDING không tồn tại"));

        // Parse and validate service from request (use fully-qualified enum to avoid name clash with BookingService interface)
        vn.fpt.se18.MentorLinking_BackEnd.util.BookingService serviceEnum;
        try {
            serviceEnum = vn.fpt.se18.MentorLinking_BackEnd.util.BookingService.valueOf(request.getService().toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException("Service không hợp lệ. Giá trị hợp lệ: " + java.util.Arrays.toString(vn.fpt.se18.MentorLinking_BackEnd.util.BookingService.values()));
        }

        // Create booking with PENDING status and PENDING payment process
        Booking booking = Booking.builder()
                .description(request.getDescription())
                .service(serviceEnum)
                .status(pendingStatus)
                .paymentProcess(PaymentProcess.PENDING)
                .mentor(mentor)
                .customer(customer)
                .schedule(schedule)
                .createdBy(customer)
                .build();

        booking = bookingRepository.save(booking);
        log.info("Booking created with ID: {} and paymentProcess: PENDING", booking.getId());

        // Create payment URL
        BigDecimal amount = BigDecimal.valueOf(schedule.getPrice());
        String paymentUrl = vnPayService.createPaymentUrl(booking.getId(), amount, httpRequest);

        log.info("Payment URL created for booking: {}", booking.getId());
        return paymentUrl;
    }

    @Override
    @Transactional
    public Long handlePaymentCallback(String vnp_TxnRef, String vnp_ResponseCode, String vnp_TransactionNo)
            throws Exception {
        log.info("Handling payment callback for booking: {}, response code: {}", vnp_TxnRef, vnp_ResponseCode);

        try {
            Long bookingId = Long.parseLong(vnp_TxnRef);

            // Get booking
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

            Long mentorId = booking.getMentor().getId();

            // Check if payment was successful (00 = success in VNPay)
            if ("00".equals(vnp_ResponseCode)) {
                log.info("Payment successful for booking: {}", bookingId);

                // IMPORTANT: Double-check if another booking for same schedule already has
                // COMPLETED status
                // This prevents race condition when 2 users pay at same time
                boolean anotherCompletedExists = bookingRepository.existsBySchedule_IdAndPaymentProcessAndIdNot(
                        booking.getSchedule().getId(),
                        PaymentProcess.COMPLETED,
                        bookingId);

                if (anotherCompletedExists) {
                    log.warn("Another booking already completed for this schedule! Failing this booking: {}",
                            bookingId);
                    // This booking arrives too late - someone else already booked it
                    booking.setPaymentProcess(PaymentProcess.WAIT_REFUND);
                    bookingRepository.save(booking);
                    return mentorId;
                }

                // Get SUCCESS status for payment
                Status successStatus = statusRepository.findByCode("SUCCESS")
                        .orElseThrow(() -> new RuntimeException("Status SUCCESS không tồn tại"));

                // Create PaymentHistory
                PaymentHistory paymentHistory = PaymentHistory.builder()
                        .booking(booking)
                        .amount(BigDecimal.valueOf(booking.getSchedule().getPrice()))
                        .transactionCode(vnp_TransactionNo)
                        .paymentMethod("VNPAY")
                        .status(successStatus)
                        .createdBy(booking.getCustomer())
                        .build();

                paymentHistoryRepository.save(paymentHistory);

                // Update booking with payment info and set paymentProcess to COMPLETED
                booking.setPaymentHistory(paymentHistory);
                booking.setPaymentProcess(PaymentProcess.COMPLETED);
                bookingRepository.save(booking);

                // Create History record for admin management (with empty description)
                History history = History.builder()
                        .booking(booking)
                        .description("") // Empty description for admin to fill later
                        .createdBy(booking.getCustomer())
                        .build();
                historyRepository.save(history);

                log.info("Payment successful! Booking {} now has paymentProcess: COMPLETED", bookingId);
            } else {
                log.warn("Payment failed for booking: {}, response code: {}", bookingId, vnp_ResponseCode);

                // Update booking with FAILED payment process
                booking.setPaymentProcess(PaymentProcess.FAILED);
                bookingRepository.save(booking);

                // Delete booking
                bookingRepository.delete(booking);
                log.info("Booking cancelled due to payment failure: {}", bookingId);
            }

            return mentorId;
        } catch (NumberFormatException e) {
            log.error("Invalid booking ID format: {}", vnp_TxnRef, e);
            throw new RuntimeException("Invalid booking ID format");
        }
    }

    @Override
    @Transactional
    public void cleanupUnpaidBookings() throws Exception {
        log.info("Cleaning up unpaid bookings...");

        try {
            // Get PENDING status
            Status pendingStatus = statusRepository.findByCode("PENDING")
                    .orElseThrow(() -> new RuntimeException("Status PENDING không tồn tại"));

            // Find all PENDING bookings older than 1 minute (without payment history)
            // Changed from 15 minutes to 1 minute for faster cleanup during testing
            LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);

            // Get all bookings to check
            var bookings = bookingRepository.findByStatus_Id(pendingStatus.getId());

            for (Booking booking : bookings) {
                // If booking is PENDING and has no payment history and was created more than 1
                // minute ago
                if (booking.getPaymentHistory() == null &&
                        booking.getCreatedAt().isBefore(oneMinuteAgo)) {

                    log.info("Deleting unpaid booking: {} (created at: {})", booking.getId(), booking.getCreatedAt());

                    // Mark schedule as not booked
                    scheduleRepository.save(booking.getSchedule());

                    // Delete booking
                    bookingRepository.delete(booking);
                }
            }

            log.info("Cleanup completed");
        } catch (Exception e) {
            log.error("Error during cleanup of unpaid bookings", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByCustomerAndPaymentProcesses(Long customerId) throws Exception {
        // Define the payment processes we want to include
        List<PaymentProcess> includedProcesses = List.of(
                PaymentProcess.COMPLETED,
                PaymentProcess.REFUNDED,
                PaymentProcess.WAIT_REFUND
        );

        List<Booking> bookings = bookingRepository.findByCustomer_IdAndPaymentProcessIn(customerId, includedProcesses);

        if (bookings == null || bookings.isEmpty()) {
            return List.of();
        }

        // Map bookings to BookingResponse
        return bookings.stream().map(b -> {
            Schedule s = b.getSchedule();

            Set<TimeSlotResponse> timeSlotResponses = s.getTimeSlots() == null ? Set.of()
                    : s.getTimeSlots().stream().map(ts -> TimeSlotResponse.builder()
                            .timeSlotId(ts.getId())
                            .timeStart(ts.getTimeStart())
                            .timeEnd(ts.getTimeEnd())
                            .build()).collect(Collectors.toSet());

            ScheduleResponse scheduleResponse = ScheduleResponse.builder()
                    .scheduleId(s.getId())
                    .date(s.getDate())
                    .timeSlots(timeSlotResponses)
                    .price(s.getPrice())
                    .emailMentor(s.getUser() != null ? s.getUser().getEmail() : null)
                    .isBooked(s.getIsBooked())
                    .build();

            return BookingResponse.builder()
                    .bookingId(b.getId())
                    .mentorId(b.getMentor() != null ? b.getMentor().getId() : null)
                    .description(b.getDescription())
                    .comment(b.getComment())
                    .paymentProcess(b.getPaymentProcess() != null ? b.getPaymentProcess().name() : null)
                    .statusName(b.getStatus() != null ? b.getStatus().getName() : null)
                    .emailMentor(b.getMentor() != null ? b.getMentor().getEmail() : null)
                    .service(b.getService() != null ? b.getService().name() : null)
                    .linkMeeting(b.getLinkMeeting())
                    .isRead(Boolean.TRUE.equals(b.getIsRead()))
                    .schedule(scheduleResponse)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelBooking(Long customerId, Long bookingId) throws Exception {
        log.info("Request to cancel booking: {} by customer: {}", bookingId, customerId);

        // Load booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

        // Check ownership
        if (booking.getCustomer() == null || !booking.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền hủy booking này");
        }

        // Check payment process - must be COMPLETED
        if (booking.getPaymentProcess() != PaymentProcess.COMPLETED) {
            throw new RuntimeException("Chỉ có thể hủy khi paymentProcess là COMPLETED");
        }

        // Compute earliest timeStart among schedule time slots
        Schedule schedule = booking.getSchedule();
        if (schedule == null) {
            throw new RuntimeException("Schedule của booking không tồn tại");
        }

        if (schedule.getTimeSlots() == null || schedule.getTimeSlots().isEmpty()) {
            throw new RuntimeException("Schedule chưa có time slot để xác định thời gian hủy");
        }

        int earliestHour = schedule.getTimeSlots().stream()
                .map(TimeSlot::getTimeStart)
                .min(Comparator.naturalOrder())
                .orElseThrow(() -> new RuntimeException("Không thể xác định time slot"));

        LocalDateTime slotStartDateTime = schedule.getDate().atTime(LocalTime.of(earliestHour, 0));

        LocalDateTime now = LocalDateTime.now();

        // Must cancel at least 3 hours before the earliest slot
        LocalDateTime cutoff = slotStartDateTime.minusHours(3);
        if (!now.isBefore(cutoff)) {
            throw new RuntimeException("Không thể hủy trong vòng 3 giờ trước khi buổi học bắt đầu");
        }

        // Get CANCELLED status
        Status cancelledStatus = statusRepository.findByCode("CANCELLED")
                .orElseThrow(() -> new RuntimeException("Status CANCELLED không tồn tại"));

        // Update booking status and payment process
        booking.setStatus(cancelledStatus);
        booking.setPaymentProcess(PaymentProcess.WAIT_REFUND);
        bookingRepository.save(booking);

        // Create history record for audit
        History history = History.builder()
                .booking(booking)
                .description("Customer cancelled booking before start time")
                .createdBy(booking.getCustomer())
                .build();
        historyRepository.save(history);

        log.info("Booking {} cancelled and paymentProcess set to WAIT_REFUND", bookingId);
    }




    @Override
    public void handleBookingAction(Long bookingId, String action, String cancelReason) throws Exception {
        Booking booking = bookingRepository.getBookingById(bookingId);
        Schedule schedule = booking.getSchedule();
        Long earliestStart = 0L;
        Long latestEnd = 0L;
        if(schedule != null && schedule.getTimeSlots() != null && !schedule.getTimeSlots().isEmpty()) {
            // Lấy earliest timeStart
             earliestStart = Long.valueOf(schedule.getTimeSlots().stream()
                .map(TimeSlot::getTimeStart)
                .min(Integer::compare)
                .orElseThrow(() -> new RuntimeException("Không thể xác định timeStart")));

            // Lấy latest timeEnd
            latestEnd = Long.valueOf(schedule.getTimeSlots().stream()
                .map(TimeSlot::getTimeEnd)
                .max(Integer::compare)
                .orElseThrow(() -> new RuntimeException("Không thể xác định timeEnd"))) ;

            System.out.println("Booking timeStart: " + earliestStart + ", timeEnd: " + latestEnd);
        }

        List<Long[]> bookingTimes = new ArrayList<>();
        if (schedule != null && schedule.getTimeSlots() != null && !schedule.getTimeSlots().isEmpty()) {
            // Sắp xếp danh sách timeslot theo timeStart
            List<TimeSlot> sortedTimeSlots = schedule.getTimeSlots().stream()
                .sorted(Comparator.comparing(TimeSlot::getTimeStart))
                .toList();

            // In ra từng timeslot
            for (TimeSlot slot : sortedTimeSlots) {
                System.out.println("TimeSlot: start=" + slot.getTimeStart() + ", end=" + slot.getTimeEnd());
            }

            // Nếu bạn muốn lưu list này vào biến khác để xử lý tiếp
            bookingTimes = sortedTimeSlots.stream()
                .map(slot -> new Long[]{slot.getTimeStart().longValue(), slot.getTimeEnd().longValue()})
                .toList();

            System.out.println("Danh sách thời gian booking:");
            bookingTimes.forEach(times ->
                System.out.println("Start: " + times[0] + ", End: " + times[1]));
        }

        User mentee = booking.getCustomer();
        User mentor = booking.getMentor();

        if(action.equals("CONFIRMED")){
            Optional<Status> status = statusRepository.findByCode("CONFIRMED");
            booking.setStatus(status.get());
            bookingRepository.save(booking);
            int randomIndex = ThreadLocalRandom.current().nextInt(googlemeet_link.size());

            // send email to mentee
            emailService.sendConfirmBooking(mentee.getEmail(), "Thông báo bổi học", mentee.getFullname(), mentor.getFullname(), booking.getService().toString(), booking.getSchedule().getDate(), bookingTimes, googlemeet_link.get(randomIndex));

            // send email to mentor
            emailService.sendConfirmBooking(mentor.getEmail(), "Thông báo bổi học", mentee.getFullname(),mentor.getFullname(), booking.getService().toString(), booking.getSchedule().getDate(), bookingTimes, googlemeet_link.get(randomIndex));

        }else if(action.equals("CANCELLED")){
            Optional<Status> status = statusRepository.findByCode("CANCELLED");
            booking.setStatus(status.get());
            booking.setPaymentProcess(PaymentProcess.WAIT_REFUND);
            booking.setComment(cancelReason);
            bookingRepository.save(booking);

            emailService.sendRejectBooking1(mentee.getEmail(), "Hủy buổi học", mentee.getFullname(), mentor.getFullname(), booking.getService().toString(), booking.getSchedule().getDate(), bookingTimes, cancelReason);
        }

    }
}
