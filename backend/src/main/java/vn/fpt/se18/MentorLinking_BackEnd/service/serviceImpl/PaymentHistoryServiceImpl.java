package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.MentorEarningsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.repository.PaymentHistoryRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.PaymentHistoryService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.MonthlyEarningResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentHistoryServiceImpl implements PaymentHistoryService {

    private final PaymentHistoryRepository paymentHistoryRepository;
    private final UserRepository userRepository;
    
    // Hằng số phần trăm hoa hồng của nền tảng
    private static final BigDecimal PLATFORM_COMMISSION_RATE = new BigDecimal("0.10"); // 10%
    private static final BigDecimal MENTOR_RATE = new BigDecimal("0.90"); // 90%

    @Override
    public MentorEarningsResponse getMentorEarnings(Long mentorId) throws Exception {
        try {
            // Get mentor information
            User mentor = userRepository.findById(mentorId)
                    .orElseThrow(() -> new Exception("Mentor không tồn tại với ID: " + mentorId));

            // Calculate total earnings for mentor from completed bookings
            BigDecimal totalEarnings = paymentHistoryRepository.calculateMentorEarnings(mentorId);

            // Calculate platform commission (10%)
            BigDecimal platformCommission = totalEarnings.multiply(PLATFORM_COMMISSION_RATE)
                    .setScale(2, RoundingMode.HALF_UP);

            // Calculate net earnings for mentor (90%)
            BigDecimal netEarnings = totalEarnings.multiply(MENTOR_RATE)
                    .setScale(2, RoundingMode.HALF_UP);

            // Monthly breakdown (repository returns Object[] rows: [month, year, total])
            List<Object[]> monthlyRows = paymentHistoryRepository.calculateMonthlyEarningsByMentor(mentorId);
            List<MonthlyEarningResponse> monthly = new ArrayList<>();
            if (monthlyRows != null) {
                for (Object[] r : monthlyRows) {
                    // r[0] = month (Number), r[1] = year (Number), r[2] = total (BigDecimal)
                    Integer month = r[0] != null ? ((Number) r[0]).intValue() : null;
                    Integer year = r[1] != null ? ((Number) r[1]).intValue() : null;
                    BigDecimal amount = r[2] != null ? (BigDecimal) r[2] : BigDecimal.ZERO;
                    String label = (month != null && year != null) ? ("Th " + month + "/" + year) : "";
                    monthly.add(MonthlyEarningResponse.builder()
                            .month(month)
                            .year(year)
                            .label(label)
                            .amount(amount)
                            .build());
                }
            }

            log.info("Mentor ID: {} - Total: {} - Commission: {} - Net: {}", 
                    mentorId, totalEarnings, platformCommission, netEarnings);

            // Build and return response
            return MentorEarningsResponse.builder()
                    .mentorId(mentorId)
                    .mentorName(mentor.getFullname())
                    .totalEarnings(totalEarnings)
                    .platformCommission(platformCommission)
                    .netEarnings(netEarnings)
                    .monthlyEarnings(monthly)
                    .build();

        } catch (Exception e) {
            log.error("Error getting mentor earnings for mentor ID: {}", mentorId, e);
            throw new Exception("Lỗi khi lấy thông tin kiếm được của mentor: " + e.getMessage());
        }
    }

    @Override
    public BigDecimal calculateMentorEarnings(Long mentorId) {
        return paymentHistoryRepository.calculateMentorEarnings(mentorId);
    }

    @Override
    public java.util.List<vn.fpt.se18.MentorLinking_BackEnd.dto.response.MonthlyEarningResponse> getMentorMonthlyEarnings(Long mentorId) throws Exception {
        try {
            List<Object[]> rows = paymentHistoryRepository.calculateMonthlyEarningsByMentor(mentorId);
            List<MonthlyEarningResponse> result = new ArrayList<>();
            if (rows != null) {
                for (Object[] r : rows) {
                    Integer month = r[0] != null ? ((Number) r[0]).intValue() : null;
                    Integer year = r[1] != null ? ((Number) r[1]).intValue() : null;
                    BigDecimal amount = r[2] != null ? (BigDecimal) r[2] : BigDecimal.ZERO;
                    String label = (month != null && year != null) ? ("Th " + month + "/" + year) : "";
                    result.add(MonthlyEarningResponse.builder()
                            .month(month)
                            .year(year)
                            .label(label)
                            .amount(amount)
                            .build());
                }
            }
            return result;
        } catch (Exception e) {
            log.error("Error getting monthly earnings for mentor ID: {}", mentorId, e);
            throw new Exception("Lỗi khi lấy thu nhập theo tháng của mentor: " + e.getMessage());
        }
    }
}

