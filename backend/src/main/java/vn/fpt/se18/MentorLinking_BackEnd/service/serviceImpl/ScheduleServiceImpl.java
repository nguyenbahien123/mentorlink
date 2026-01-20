package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.ScheduleRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.ScheduleResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.TimeSlotResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Schedule;
import vn.fpt.se18.MentorLinking_BackEnd.entity.TimeSlot;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.repository.ScheduleRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.BookingRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.TimeSlotRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.ScheduleService;
import vn.fpt.se18.MentorLinking_BackEnd.util.PaymentProcess;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final BookingRepository bookingRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final UserRepository userRepository;

    @Override
    public List<ScheduleResponse> getUpcomingSchedulesForMentor(Long mentorId) {
        LocalDate from = LocalDate.now();
        LocalDate to = from.plusDays(2);

        List<Schedule> schedules = scheduleRepository.findByMentorIdAndDateBetween(mentorId, from, to);

        if (schedules == null || schedules.isEmpty()) {
            return List.of();
        }

        // Filter out schedules for "today" that have any timeSlot with timeStart
        // earlier than current hour
        final LocalDate today = from;
        final int currentHour = LocalTime.now().getHour();
        List<Schedule> filteredSchedules = schedules.stream()
                .filter(s -> {
                    if (s.getDate() != null && s.getDate().isEqual(today)) {
                        Set<TimeSlot> slots = s.getTimeSlots();
                        if (slots != null && !slots.isEmpty()) {
                            boolean anySlotInPast = slots.stream()
                                    .anyMatch(ts -> ts != null && ts.getTimeStart() != null
                                            && ts.getTimeStart() < currentHour);
                            return !anySlotInPast; // exclude schedule if any slot is in the past
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());

        if (filteredSchedules == null || filteredSchedules.isEmpty()) {
            return List.of();
        }

        // Collect schedule ids and query booked ones in batch to avoid N+1
        List<Long> scheduleIds = filteredSchedules.stream().map(Schedule::getId).collect(Collectors.toList());

        // New: get schedule ids that have a COMPLETED paymentProcess booking
        List<Long> completedBookedIdsList = bookingRepository.findScheduleIdsByIdsAndPaymentProcess(scheduleIds,
                PaymentProcess.COMPLETED);
        Set<Long> completedBookedIds = completedBookedIdsList == null ? Set.of()
                : completedBookedIdsList.stream().collect(Collectors.toSet());

        return filteredSchedules.stream().map(s -> {
            Set<TimeSlotResponse> timeSlotResponses = s.getTimeSlots() == null ? Set.of()
                    : s.getTimeSlots().stream().map((TimeSlot ts) -> TimeSlotResponse.builder()
                            .timeSlotId(ts.getId())
                            .timeStart(ts.getTimeStart())
                            .timeEnd(ts.getTimeEnd())
                            .build()).collect(Collectors.toSet());

            // Determine isBooked: true if schedule entity has flag true OR has any COMPLETED booking
            boolean isBookedFlag = s.getIsBooked() != null && s.getIsBooked();
            boolean hasCompletedBooking = completedBookedIds.contains(s.getId());

            return ScheduleResponse.builder()
                    .scheduleId(s.getId())
                    .date(s.getDate())
                    .timeSlots(timeSlotResponses)
                    .price(s.getPrice())
                    .emailMentor(s.getUser() != null ? s.getUser().getEmail() : null)
                    .isBooked(isBookedFlag || hasCompletedBooking)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ScheduleResponse createSchedule(ScheduleRequest scheduleRequest, Long mentorId) {
        // Validate mentor exists
        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found with id: " + mentorId));

        // Validate time slots exist
        List<TimeSlot> timeSlots = timeSlotRepository.findByIdIn(scheduleRequest.getTimeSlotIds());
        if (timeSlots.size() != scheduleRequest.getTimeSlotIds().size()) {
            throw new RuntimeException("One or more time slots not found");
        }

        // Check for duplicate schedules (same mentor, date, and overlapping time slots)
        List<Long> timeSlotIdsList = new ArrayList<>(scheduleRequest.getTimeSlotIds());
        if (scheduleRepository.existsByMentorIdAndDateAndTimeSlotIds(
                mentorId, scheduleRequest.getDate(), timeSlotIdsList)) {
            throw new RuntimeException("Schedule already exists for the selected date and time slots");
        }

        // Create schedule entity
        Schedule schedule = Schedule.builder()
                .date(scheduleRequest.getDate())
                .timeSlots(new HashSet<>(timeSlots))
                .price(scheduleRequest.getPrice())
                .user(mentor)
                .createdBy(mentor)
                .isBooked(false)
                .build();

        schedule = scheduleRepository.save(schedule);
        return mapToScheduleResponse(schedule);
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleResponse getScheduleById(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found with id: " + scheduleId));
        return mapToScheduleResponse(schedule);
    }

    @Override
    @Transactional
    public ScheduleResponse updateSchedule(Long scheduleId, ScheduleRequest scheduleRequest, Long mentorId) {
        // Find schedule and verify ownership
        Schedule schedule = scheduleRepository.findByIdAndMentorId(scheduleId, mentorId)
                .orElseThrow(() -> new RuntimeException("Schedule not found or access denied"));

        // Check if schedule is already booked
        if (Boolean.TRUE.equals(schedule.getIsBooked())) {
            throw new RuntimeException("Cannot update booked schedule");
        }

        // Check for bookings with COMPLETED payment
        List<Long> completedBookings = bookingRepository.findScheduleIdsByIdsAndPaymentProcess(
                List.of(scheduleId), PaymentProcess.COMPLETED);
        if (!completedBookings.isEmpty()) {
            throw new RuntimeException("Cannot update schedule with completed bookings");
        }

        // Validate time slots exist
        List<TimeSlot> timeSlots = timeSlotRepository.findByIdIn(scheduleRequest.getTimeSlotIds());
        if (timeSlots.size() != scheduleRequest.getTimeSlotIds().size()) {
            throw new RuntimeException("One or more time slots not found");
        }

        // Check for duplicate schedules (excluding current schedule)
        List<Long> timeSlotIdsList = new ArrayList<>(scheduleRequest.getTimeSlotIds());
        Schedule existingSchedule = scheduleRepository.findByMentorId(mentorId).stream()
                .filter(s -> !s.getId().equals(scheduleId))
                .filter(s -> s.getDate().equals(scheduleRequest.getDate()))
                .filter(s -> s.getTimeSlots().stream().anyMatch(ts -> timeSlotIdsList.contains(ts.getId())))
                .findFirst()
                .orElse(null);

        if (existingSchedule != null) {
            throw new RuntimeException("Schedule already exists for the selected date and time slots");
        }

        // Update schedule
        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

        schedule.setDate(scheduleRequest.getDate());
        schedule.setTimeSlots(new HashSet<>(timeSlots));
        schedule.setPrice(scheduleRequest.getPrice());
        schedule.setUpdatedBy(mentor);

        schedule = scheduleRepository.save(schedule);
        return mapToScheduleResponse(schedule);
    }

    @Override
    @Transactional
    public void deleteSchedule(Long scheduleId, Long mentorId) {
        // Find schedule and verify ownership
        Schedule schedule = scheduleRepository.findByIdAndMentorId(scheduleId, mentorId)
                .orElseThrow(() -> new RuntimeException("Schedule not found or access denied"));

        // Check if schedule is already booked
        if (Boolean.TRUE.equals(schedule.getIsBooked())) {
            throw new RuntimeException("Cannot delete booked schedule");
        }

        // Check for bookings with COMPLETED payment
        List<Long> completedBookings = bookingRepository.findScheduleIdsByIdsAndPaymentProcess(
                List.of(scheduleId), PaymentProcess.COMPLETED);
        if (!completedBookings.isEmpty()) {
            throw new RuntimeException("Cannot delete schedule with completed bookings");
        }

        scheduleRepository.delete(schedule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getAllSchedulesForMentor(Long mentorId) {
        List<Schedule> schedules = scheduleRepository.findByMentorId(mentorId);

        if (schedules == null || schedules.isEmpty()) {
            return List.of();
        }

        // Get booking status for all schedules
        List<Long> scheduleIds = schedules.stream().map(Schedule::getId).collect(Collectors.toList());
        List<Long> completedBookedIds = bookingRepository.findScheduleIdsByIdsAndPaymentProcess(
                scheduleIds, PaymentProcess.COMPLETED);
        Set<Long> completedBookedSet = completedBookedIds == null ? Set.of()
                : new HashSet<>(completedBookedIds);

        return schedules.stream()
                .map(schedule -> mapToScheduleResponse(schedule, completedBookedSet))
                .collect(Collectors.toList());
    }

    private ScheduleResponse mapToScheduleResponse(Schedule schedule) {
        return mapToScheduleResponse(schedule, Set.of());
    }

    private ScheduleResponse mapToScheduleResponse(Schedule schedule, Set<Long> completedBookedIds) {
        Set<TimeSlotResponse> timeSlotResponses = schedule.getTimeSlots() == null ? Set.of()
                : schedule.getTimeSlots().stream()
                    .map(ts -> TimeSlotResponse.builder()
                            .timeSlotId(ts.getId())
                            .timeStart(ts.getTimeStart())
                            .timeEnd(ts.getTimeEnd())
                            .build())
                    .collect(Collectors.toSet());

        // Determine isBooked status
        boolean isBookedFlag = schedule.getIsBooked() != null && schedule.getIsBooked();
        boolean hasCompletedBooking = completedBookedIds.contains(schedule.getId());

        return ScheduleResponse.builder()
                .scheduleId(schedule.getId())
                .date(schedule.getDate())
                .timeSlots(timeSlotResponses)
                .price(schedule.getPrice())
                .emailMentor(schedule.getUser() != null ? schedule.getUser().getEmail() : null)
                .isBooked(isBookedFlag || hasCompletedBooking)
                .build();
    }
}
