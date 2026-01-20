package vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.review;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewFilterRequest {
    private String keySearch; // Tìm theo customer name, mentor name, comment
    private Integer rating; // Filter theo số sao (1-5)
    private String status; // published, pending, reported
    private String dateFrom;
    private String dateTo;
    
    @Builder.Default
    private Integer page = 1;
    
    @Builder.Default
    private Integer size = 10;
}
