package vn.fpt.se18.MentorLinking_BackEnd.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorEarningsResponse {
    private Long mentorId;
    private String mentorName;
    private BigDecimal totalEarnings;           // Tổng thu nhập từ các booking
    private BigDecimal platformCommission;      // Hoa hồng của nền tảng (10%)
    private BigDecimal netEarnings;             // Thu nhập thực nhận của mentor (90%)
}

