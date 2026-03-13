package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.response.MentorEarningsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.MonthlyEarningResponse;

import java.math.BigDecimal;
import java.util.List;

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

    /**
     * Get monthly earnings breakdown for a mentor
     */
    List<MonthlyEarningResponse> getMentorMonthlyEarnings(Long mentorId) throws Exception;
}

