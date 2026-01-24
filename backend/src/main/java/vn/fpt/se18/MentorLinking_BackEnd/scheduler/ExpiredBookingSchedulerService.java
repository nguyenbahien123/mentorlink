package vn.fpt.se18.MentorLinking_BackEnd.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Booking;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Schedule;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.TimeSlot;
import vn.fpt.se18.MentorLinking_BackEnd.repository.BookingRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.ScheduleRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.util.PaymentProcess;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Scheduled task to automatically mark PENDING bookings as EXPIRED
 * when their scheduled time has passed without being processed by the mentor.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ExpiredBookingSchedulerService {

    private final BookingRepository bookingRepository;
    private final StatusRepository statusRepository;
    private final ScheduleRepository scheduleRepository;

    /**
     * Run every 10 minutes to check and mark expired pending bookings.
     * This task finds all bookings with PENDING status and COMPLETED payment,
     * then checks if the meeting time (date + latest timeSlot end time) has passed.
     * If yes, updates the status to CANCELLED and frees the schedule.
     */
    @Scheduled(fixedRate = 600000) // Run every 10 minutes (600,000 milliseconds)
    @Transactional
    public void markExpiredPendingBookings() {
        try {
            log.info("Starting scheduled task to mark expired pending bookings...");

            LocalDateTime now = LocalDateTime.now();
            LocalDate today = now.toLocalDate();
            LocalTime currentTime = now.toLocalTime();

            // Find all bookings with PENDING status and COMPLETED payment process
            List<Booking> pendingBookings = bookingRepository.findByStatusCodeAndPaymentProcess(
                    "PENDING",
                    PaymentProcess.COMPLETED
            );

            if (pendingBookings.isEmpty()) {
                log.debug("No pending bookings found to check");
                return;
            }

            log.info("Found {} pending bookings to check for expiration", pendingBookings.size());

            // Get CANCELLED status (we'll use this to mark expired bookings)
            Optional<Status> cancelledStatusOpt = statusRepository.findByCode("CANCELLED");
            if (cancelledStatusOpt.isEmpty()) {
                log.error("CANCELLED status not found in database. Cannot update bookings.");
                return;
            }
            Status cancelledStatus = cancelledStatusOpt.get();

            int expiredCount = 0;

            for (Booking booking : pendingBookings) {
                try {
                    if (booking == null || booking.getSchedule() == null) {
                        continue;
                    }

                    Schedule schedule = booking.getSchedule();
                    LocalDate bookingDate = schedule.getDate();

                    // Check if booking date is before today - definitely expired
                    if (bookingDate.isBefore(today)) {
                        markBookingAsExpired(booking, schedule, cancelledStatus, "Quá hạn xử lý");
                        expiredCount++;
                        log.info("Marked booking ID {} as expired - Date was in the past: {}", 
                                booking.getId(), bookingDate);
                        continue;
                    }

                    // If booking date is today, check the time
                    if (bookingDate.isEqual(today)) {
                        // Get the latest (max) end time from all time slots
                        Optional<Integer> maxEndTimeOpt = Optional.empty();
                        if (schedule.getTimeSlots() != null) {
                            maxEndTimeOpt = schedule.getTimeSlots()
                                    .stream()
                                    .map(TimeSlot::getTimeEnd)
                                    .filter(java.util.Objects::nonNull)
                                    .max(Integer::compareTo);
                        }

                        if (maxEndTimeOpt.isPresent()) {
                            int endHour = maxEndTimeOpt.get();

                            if (endHour < 0 || endHour > 24) {
                                log.warn("Booking ID {} has invalid timeEnd value: {}. Expected 0-24. Skipping.", 
                                        booking.getId(), endHour);
                                continue;
                            }

                            LocalTime endTime;
                            if (endHour == 24) {
                                endTime = LocalTime.MAX;
                            } else {
                                endTime = LocalTime.of(endHour, 0);
                            }

                            // If current time is after the end time, mark as expired
                            if (currentTime.isAfter(endTime)) {
                                markBookingAsExpired(booking, schedule, cancelledStatus, "Quá hạn xử lý");
                                expiredCount++;
                                log.info("Marked booking ID {} as expired - Meeting ended at {}:00, current time: {}", 
                                        booking.getId(), endHour, currentTime);
                            }
                        } else {
                            log.warn("Booking ID {} has no time slots defined", booking.getId());
                        }
                    }
                    // If booking date is in the future, skip it

                } catch (Exception e) {
                    log.error("Error processing booking ID {}: {}", booking.getId(), e.getMessage(), e);
                    // Continue with next booking even if one fails
                }
            }

            log.info("Scheduled task completed. Marked {} pending booking(s) as expired", expiredCount);

        } catch (Exception e) {
            log.error("Error in scheduled task markExpiredPendingBookings: {}", e.getMessage(), e);
        }
    }

    /**
     * Helper method to mark a booking as expired/cancelled and free the schedule
     */
    private void markBookingAsExpired(Booking booking, Schedule schedule, Status cancelledStatus, String reason) {
        // Mark booking as cancelled with reason
        booking.setStatus(cancelledStatus);
        booking.setComment(reason);
        booking.setPaymentProcess(PaymentProcess.WAIT_REFUND);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // Free the schedule slot
        if (schedule != null) {
            schedule.setIsBooked(false);
            scheduleRepository.save(schedule);
            log.debug("Freed schedule ID {} for expired booking ID {}", schedule.getId(), booking.getId());
        }
    }
}
