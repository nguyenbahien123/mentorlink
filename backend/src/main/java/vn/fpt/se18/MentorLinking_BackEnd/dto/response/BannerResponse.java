package vn.fpt.se18.MentorLinking_BackEnd.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerResponse {
    private Long bannerId;

    private String title;

    private String imageUrl;

    private String linkUrl;

    private String statusName;

    private Integer position;

    private java.time.LocalDate startDate;

    private java.time.LocalDate endDate;

    private Boolean isPublished;
}
