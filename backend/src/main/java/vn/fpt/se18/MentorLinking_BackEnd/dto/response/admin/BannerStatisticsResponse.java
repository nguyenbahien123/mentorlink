package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerStatisticsResponse {
    private Integer totalBanners;
    private Integer activeBanners;
    private Integer inactiveBanners;
    private Integer pendingBanners;
    private Integer expiredBanners;
    private Long totalViews;
    private Long totalClicks;
    private Double averageCTR;
}
