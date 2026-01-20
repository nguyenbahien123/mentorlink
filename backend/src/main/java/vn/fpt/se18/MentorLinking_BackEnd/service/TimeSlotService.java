package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.response.TimeSlotResponse;

import java.util.List;

public interface TimeSlotService {
    
    /**
     * Get all available time slots
     * @return list of time slot responses
     */
    List<TimeSlotResponse> getAllTimeSlots();
    
    /**
     * Initialize time slots data
     * @return result message
     */
    String initTimeSlots();
}