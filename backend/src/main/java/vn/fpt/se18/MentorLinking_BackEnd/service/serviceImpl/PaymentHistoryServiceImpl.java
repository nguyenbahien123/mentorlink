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
            
            log.info("Mentor ID: {} - Total: {} - Commission: {} - Net: {}", 
                    mentorId, totalEarnings, platformCommission, netEarnings);

            // Build and return response
            return MentorEarningsResponse.builder()
                    .mentorId(mentorId)
                    .mentorName(mentor.getFullname())
                    .totalEarnings(totalEarnings)
                    .platformCommission(platformCommission)
                    .netEarnings(netEarnings)
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
}

