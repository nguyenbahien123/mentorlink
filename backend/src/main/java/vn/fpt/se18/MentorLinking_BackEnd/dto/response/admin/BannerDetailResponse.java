package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerDetailResponse {
    private Long id;
    private String title;
    private String imageUrl;
    private String linkUrl;
    private Integer position;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isPublished;
    private Integer viewCount;
    private Integer clickCount;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;
}
