package vn.fpt.se18.MentorLinking_BackEnd.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Booking;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.TimeSlot;
import vn.fpt.se18.MentorLinking_BackEnd.repository.BookingRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.util.PaymentProcess;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Scheduled task to automatically update booking status from CONFIRMED to COMPLETED
 * when the meeting time has passed.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingStatusSchedulerService {

    private final BookingRepository bookingRepository;
    private final StatusRepository statusRepository;
    private final UserRepository userRepository;

    /**
     * Run every 5 minutes to check and update booking status.
     * This task finds all bookings with CONFIRMED status and COMPLETED payment process,
     * then checks if the meeting time (date + latest timeSlot end time) has passed.
     * If yes, updates the status to COMPLETED.
     */
    @Scheduled(fixedRate = 300000) // Run every 5 minutes (300,000 milliseconds)
    @Transactional
    public void updateExpiredBookings() {
        try {
            log.info("Starting scheduled task to update expired bookings...");

            LocalDateTime now = LocalDateTime.now();
            LocalDate today = now.toLocalDate();
            LocalTime currentTime = now.toLocalTime();

            // Find all bookings with CONFIRMED status and COMPLETED payment process
            List<Booking> confirmedBookings = bookingRepository.findByStatusCodeAndPaymentProcess(
                    "CONFIRMED",
                    PaymentProcess.COMPLETED
            );

            if (confirmedBookings.isEmpty()) {
                log.debug("No confirmed bookings found to check");
                return;
            }

            log.info("Found {} confirmed bookings to check", confirmedBookings.size());

            // Get COMPLETED status
            Optional<Status> completedStatusOpt = statusRepository.findByCode("COMPLETED");
            if (completedStatusOpt.isEmpty()) {
                log.error("COMPLETED status not found in database. Cannot update bookings.");
                return;
            }
            Status completedStatus = completedStatusOpt.get();

            int updatedCount = 0;

            for (Booking booking : confirmedBookings) {
                try {
                    if (booking == null) {
                        continue;
                    }

                    if (booking.getSchedule() == null) {
                        log.warn("Booking ID {} has no schedule, skipping", booking.getId());
                        continue;
                    }

                    LocalDate bookingDate = booking.getSchedule().getDate();

                    // Check if booking date is before today - definitely expired
                    if (bookingDate.isBefore(today)) {
                        updateBookingToCompleted(booking, completedStatus);
                        updatedCount++;
                        log.info("Updated booking ID {} - Date was in the past: {}", 
                                booking.getId(), bookingDate);
                        continue;
                    }

                    // If booking date is today, check the time
                    if (bookingDate.isEqual(today)) {
                        // Get the latest (max) end time from all time slots
                        Optional<Integer> maxEndTimeOpt = Optional.empty();
                        if (booking.getSchedule().getTimeSlots() != null) {
                            maxEndTimeOpt = booking.getSchedule().getTimeSlots()
                                    .stream()
                                    .map(TimeSlot::getTimeEnd)
                                    .filter(java.util.Objects::nonNull)
                                    .max(Integer::compareTo);
                        }

                        if (maxEndTimeOpt.isPresent()) {
                            int endHour = maxEndTimeOpt.get();

                            // endHour is guaranteed non-null here because we filtered non-null values

                            if (endHour < 0 || endHour > 24) {
                                log.warn("Booking ID {} has invalid timeEnd value: {}. Expected 0-24. Skipping.", booking.getId(), endHour);
                                continue;
                            }

                            LocalTime endTime;
                            if (endHour == 24) {
                                // 24 means end of day, use LocalTime.MAX to represent 23:59:59.999999999
                                endTime = LocalTime.MAX;
                            } else {
                                endTime = LocalTime.of(endHour, 0);
                            }

                            // If current time is after the end time, update to COMPLETED
                            if (currentTime.isAfter(endTime)) {
                                updateBookingToCompleted(booking, completedStatus);
                                updatedCount++;
                                log.info("Updated booking ID {} - Meeting ended at {}:00, current time: {}", 
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

            log.info("Scheduled task completed. Updated {} booking(s) to COMPLETED status", updatedCount);

        } catch (Exception e) {
            log.error("Error in scheduled task updateExpiredBookings: {}", e.getMessage(), e);
        }
    }

    /**
     * Helper method to update a booking to COMPLETED status
     */
    private void updateBookingToCompleted(Booking booking, Status completedStatus) {
        booking.setStatus(completedStatus);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
        // Increment mentor's numberOfBooking when a booking is completed
        try {
            if (booking.getMentor() != null) {
                var mentor = booking.getMentor();
                Integer current = mentor.getNumberOfBooking();
                mentor.setNumberOfBooking(current == null ? 1 : current + 1);
                userRepository.save(mentor);
                log.debug("Incremented numberOfBooking for mentor id {} to {}", mentor.getId(), mentor.getNumberOfBooking());
            } else {
                log.warn("Booking ID {} has no mentor assigned, cannot increment numberOfBooking", booking.getId());
            }
        } catch (Exception e) {
            log.error("Failed to increment mentor's numberOfBooking for booking ID {}: {}", booking.getId(), e.getMessage(), e);
        }
    }
}
