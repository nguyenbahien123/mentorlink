package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.response.MentorEarningsResponse;

import java.math.BigDecimal;

public interface PaymentHistoryService {
    /**
     * Get total earnings for a specific mentor from completed bookings
     *
     * @param mentorId the ID of the mentor
     * @return MentorEarningsResponse containing mentor info and total earnings
     */
    MentorEarningsResponse getMentorEarnings(Long mentorId) throws Exception;

    /**
     * Get total earnings for a specific mentor as BigDecimal
     *
     * @param mentorId the ID of the mentor
     * @return total earnings amount
     */
    BigDecimal calculateMentorEarnings(Long mentorId);
}

