package vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorAd;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class MentorAdResponse {

    private Long id;
    private String title;
    private String imageUrl;
    private String linkUrl;
    private String status;
    private Integer position;
    private Boolean isPublished;
    private Integer viewCount;
    private Integer clickCount;
    private UserSimpleResponse mentor;
    private UserSimpleResponse reviewedBy;
    private String rejectionReason;
    private LocalDateTime createdAt;

    @Getter
    @Setter
    @Builder
    public static class UserSimpleResponse {
        private Long id;
        private String fullName;
    }

    public static MentorAdResponse fromEntity(MentorAd ad) {
        if (ad == null) return null;

        User reviewedByAdmin = ad.getReviewedBy();
        UserSimpleResponse reviewedByDto = null;
        if (reviewedByAdmin != null) {
            reviewedByDto = UserSimpleResponse.builder()
                    .id(reviewedByAdmin.getId())
                    .fullName(reviewedByAdmin.getFullname())
                    .build();
        }

        return MentorAdResponse.builder()
                .id(ad.getId())
                .title(ad.getTitle())
                .imageUrl(ad.getImageUrl())
                .linkUrl(ad.getLinkUrl())
                .status(ad.getStatus().name())
                .position(ad.getPosition())
                .isPublished(ad.getIsPublished())
                .viewCount(ad.getViewCount())
                .clickCount(ad.getClickCount())
                .mentor(UserSimpleResponse.builder()
                        .id(ad.getMentor().getId())
                        .fullName(ad.getMentor().getFullname())
                        .build())
                .reviewedBy(reviewedByDto)
                .rejectionReason(ad.getRejectionReason())
                .createdAt(ad.getCreatedAt())
                .build();
    }
}