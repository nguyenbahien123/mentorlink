package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.TimeSlotResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.TimeSlot;
import vn.fpt.se18.MentorLinking_BackEnd.repository.TimeSlotRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.TimeSlotService;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TimeSlotServiceImpl implements TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;

    @Override
    public List<TimeSlotResponse> getAllTimeSlots() {
        List<TimeSlot> timeSlots = timeSlotRepository.findAll();
        
        return timeSlots.stream()
                .map(this::mapToTimeSlotResponse)
                .sorted((a, b) -> a.getTimeStart().compareTo(b.getTimeStart()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public String initTimeSlots() {
        // Check if time slots already exist
        long count = timeSlotRepository.count();
        if (count > 0) {
            return "Time slots already exist (" + count + " slots). Skipping initialization.";
        }

        // Create time slots from 8:00 to 22:00 (8 AM to 10 PM)
        List<TimeSlot> timeSlots = new ArrayList<>();
        for (int hour = 8; hour <= 21; hour++) {
            TimeSlot timeSlot = TimeSlot.builder()
                    .code("SLOT_" + hour + "_" + (hour + 1))
                    .timeStart(hour)
                    .timeEnd(hour + 1)
                    .build();
            timeSlots.add(timeSlot);
        }

        timeSlotRepository.saveAll(timeSlots);
        return "Successfully initialized " + timeSlots.size() + " time slots (8:00-22:00).";
    }

    private TimeSlotResponse mapToTimeSlotResponse(TimeSlot timeSlot) {
        return TimeSlotResponse.builder()
                .timeSlotId(timeSlot.getId())
                .timeStart(timeSlot.getTimeStart())
                .timeEnd(timeSlot.getTimeEnd())
                .build();
    }
}