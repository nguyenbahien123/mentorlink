package vn.fpt.se18.MentorLinking_BackEnd.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyEarningResponse {
    private Integer month;
    private Integer year;
    private String label; // e.g., "Th 1/2026"
    private BigDecimal amount;
}
