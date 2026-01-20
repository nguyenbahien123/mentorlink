package vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.banner;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerUpdateRequest {
    private String title;
    private String imageUrl;
    private String linkUrl;
    private Integer position;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isPublished;
}
