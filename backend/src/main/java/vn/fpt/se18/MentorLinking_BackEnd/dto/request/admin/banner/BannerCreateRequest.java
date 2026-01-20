package vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.banner;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerCreateRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    
    @NotBlank(message = "URL hình ảnh không được để trống")
    private String imageUrl;
    
    private String linkUrl;
    
    @NotNull(message = "Vị trí không được để trống")
    private Integer position;
    
    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;
    
    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;
    
    @Builder.Default
    private Boolean isPublished = false;
}
