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
public class BannerFilterRequest {
    private String keySearch;
    private String status;
    private Boolean isPublished;
    private LocalDate dateFrom;
    private LocalDate dateTo;
    
    @Builder.Default
    private Integer page = 1;
    
    @Builder.Default
    private Integer size = 10;
}
