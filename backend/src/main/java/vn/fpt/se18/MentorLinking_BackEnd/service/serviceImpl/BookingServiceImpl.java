package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import vn.fpt.se18.MentorLinking_BackEnd.service.PayOsService;
import vn.fpt.se18.MentorLinking_BackEnd.service.DistributedLockService;
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
    private final PayOsService payOsService;
    private final EmailService emailService;
    private final DistributedLockService distributedLockService;

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

        // Try to acquire lock for this schedule (wait max 5 seconds)
        boolean lockAcquired = distributedLockService.tryLock(request.getScheduleId(), 5);
        if (!lockAcquired) {
            throw new RuntimeException("Lịch này đang được xử lý bởi người khác. Vui lòng thử lại sau giây lát.");
        }

        try {
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

            // Create PayOS payment and get checkout URL for redirect
            BigDecimal amount = BigDecimal.valueOf(schedule.getPrice());
            String paymentDescription = "Dat lich #" + booking.getId();
            
            // Return checkoutUrl directly for frontend redirect
            String checkoutUrl = payOsService.createPaymentUrl(booking.getId(), amount, paymentDescription);
            
            log.info("Payment checkout URL created for booking: {}", booking.getId());
            
            return checkoutUrl;
        } finally {
            // Always release lock, even if exception occurs
            distributedLockService.unlock(request.getScheduleId());
        }
    }

    @Override
    @Transactional
        public Long handlePaymentCallback(Long orderCode, boolean success, String transactionCode)
            throws Exception {
        log.info("Handling PayOS payment callback for booking: {}, success: {}", orderCode, success);

        if (orderCode == null) {
            throw new RuntimeException("Thiếu orderCode từ PayOS");
        }

        Booking booking = bookingRepository.findById(orderCode)
            .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

        Long mentorId = booking.getMentor().getId();

        // Idempotent guard: if already completed or wait_refund, do not duplicate history
        if (booking.getPaymentProcess() == PaymentProcess.COMPLETED
            || booking.getPaymentProcess() == PaymentProcess.WAIT_REFUND) {
            return mentorId;
        }

        if (success) {
            // Prevent race condition when two users pay for same schedule
            boolean anotherCompletedExists = bookingRepository.existsBySchedule_IdAndPaymentProcessAndIdNot(
                booking.getSchedule().getId(),
                PaymentProcess.COMPLETED,
                booking.getId());

            if (anotherCompletedExists) {
            log.warn("Another booking already completed for this schedule! Marking current booking {} as WAIT_REFUND",
                booking.getId());
            booking.setPaymentProcess(PaymentProcess.WAIT_REFUND);
            bookingRepository.save(booking);
            return mentorId;
            }

            Status successStatus = statusRepository.findByCode("SUCCESS")
                .orElseThrow(() -> new RuntimeException("Status SUCCESS không tồn tại"));

            String resolvedTransactionCode = (transactionCode == null || transactionCode.isBlank())
                ? "PAYOS-" + booking.getId() + "-" + System.currentTimeMillis()
                : transactionCode;

            PaymentHistory paymentHistory = PaymentHistory.builder()
                .booking(booking)
                .amount(BigDecimal.valueOf(booking.getSchedule().getPrice()))
                .transactionCode(resolvedTransactionCode)
                .paymentMethod("PAYOS")
                .status(successStatus)
                .createdBy(booking.getCustomer())
                .build();

            paymentHistoryRepository.save(paymentHistory);

            booking.setPaymentHistory(paymentHistory);
            booking.setPaymentProcess(PaymentProcess.COMPLETED);
            bookingRepository.save(booking);

            // Mark schedule as booked to prevent further bookings
            try {
                Schedule bookedSchedule = booking.getSchedule();
                if (bookedSchedule != null) {
                    bookedSchedule.setIsBooked(true);
                    scheduleRepository.save(bookedSchedule);
                }
            } catch (Exception e) {
                log.warn("Không thể đánh dấu schedule là đã đặt: {}", e.getMessage());
            }

            // Prepare bookingTimes and send confirmation emails to mentee and mentor
            try {
                Schedule s = booking.getSchedule();
                List<Long[]> bookingTimes = List.of();
                if (s != null && s.getTimeSlots() != null && !s.getTimeSlots().isEmpty()) {
                    List<TimeSlot> sortedTimeSlots = s.getTimeSlots().stream()
                            .sorted(Comparator.comparing(TimeSlot::getTimeStart))
                            .toList();
                    bookingTimes = sortedTimeSlots.stream()
                            .map(slot -> new Long[]{slot.getTimeStart().longValue(), slot.getTimeEnd().longValue()})
                            .toList();
                }

                int randomIndex = ThreadLocalRandom.current().nextInt(googlemeet_link.size());
                String meetingLink = googlemeet_link.get(randomIndex);

                User mentee = booking.getCustomer();
                User mentorUser = booking.getMentor();

                // Send booking-success email to mentee (waiting for mentor response)
                try {
                    emailService.sendBookingSuccessToMentee(
                            mentee.getEmail(),
                            "Đặt lịch thành công - MentorLink",
                            mentee.getFullname(),
                            mentorUser.getFullname(),
                            booking.getService().toString(),
                            booking.getSchedule().getDate(),
                            bookingTimes,
                            meetingLink
                    );
                    log.info("📧 Đã gửi email đặt lịch thành công tới mentee: {}", mentee.getEmail());
                } catch (Exception e) {
                    log.warn("⚠️ Không thể gửi email đặt lịch thành công tới mentee {}: {}", mentee.getEmail(), e.getMessage());
                }

                // Send email to mentor (mentor-specific template)
                try {
                    emailService.sendMentorBookingNotification(
                            mentorUser.getEmail(),
                            "Thông báo có mentee đặt lịch - MentorLink",
                            mentee.getFullname(),
                            mentorUser.getFullname(),
                            booking.getService().toString(),
                            booking.getSchedule().getDate(),
                            bookingTimes,
                            meetingLink
                    );
                    log.info("📧 Đã gửi email thông báo tới mentor: {}", mentorUser.getEmail());
                } catch (Exception e) {
                    log.warn("⚠️ Không thể gửi email thông báo tới mentor {}: {}", mentorUser.getEmail(), e.getMessage());
                }

            } catch (Exception e) {
                log.warn("⚠️ Lỗi khi chuẩn bị và gửi email xác nhận booking: {}", e.getMessage());
            }

            History history = History.builder()
                .booking(booking)
                .description("")
                .createdBy(booking.getCustomer())
                .build();
            historyRepository.save(history);

            log.info("Payment successful! Booking {} now has paymentProcess: COMPLETED", booking.getId());
        } else {
            log.warn("Payment failed or cancelled for booking: {}", booking.getId());

            booking.setPaymentProcess(PaymentProcess.FAILED);
            bookingRepository.save(booking);
            bookingRepository.delete(booking);
            log.info("Booking cancelled due to payment failure: {}", booking.getId());
        }

        return mentorId;
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
                    .createdAt(b.getCreatedAt())
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

            // send email to mentee (template)
            emailService.sendConfirmBooking(mentee.getEmail(), "Thông báo buổi học - MentorLink", mentee.getFullname(), mentor.getFullname(), booking.getService().toString(), booking.getSchedule().getDate(), bookingTimes, googlemeet_link.get(randomIndex));

            // send email to mentor: use lesson reminder template when mentor CONFIRMS
            emailService.sendConfirmBooking(mentor.getEmail(), "Thông báo buổi học - MentorLink", mentee.getFullname(), mentor.getFullname(), booking.getService().toString(), booking.getSchedule().getDate(), bookingTimes, googlemeet_link.get(randomIndex));

        }else if(action.equals("CANCELLED")){
            Optional<Status> status = statusRepository.findByCode("CANCELLED");
            booking.setStatus(status.get());
            booking.setPaymentProcess(PaymentProcess.WAIT_REFUND);
            booking.setComment(cancelReason);
            bookingRepository.save(booking);

            // Release schedule so the slot becomes available again
            if (schedule != null) {
                schedule.setIsBooked(false);
                scheduleRepository.save(schedule);
            }

            // Notify mentee about the rejection
            emailService.sendRejectBooking1(mentee.getEmail(), "Hủy buổi học", mentee.getFullname(), mentor.getFullname(), booking.getService().toString(), booking.getSchedule().getDate(), bookingTimes, cancelReason);
        }

    }
}
