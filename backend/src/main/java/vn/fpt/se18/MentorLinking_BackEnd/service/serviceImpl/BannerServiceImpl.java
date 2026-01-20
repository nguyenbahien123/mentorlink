package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BannerResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Banner;
import vn.fpt.se18.MentorLinking_BackEnd.repository.BannerRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.BannerService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;

    @Override
    public List<BannerResponse> getTop5ActivePublished() {
        List<Banner> banners = bannerRepository.findTop5ByStatus_NameAndIsPublishedOrderByPositionAsc("Active", Boolean.TRUE);
        return banners.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private BannerResponse toResponse(Banner b) {
        if (b == null) return null;
        return BannerResponse.builder()
                .bannerId(b.getId())
                .title(b.getTitle())
                .imageUrl(b.getImageUrl())
                .linkUrl(b.getLinkUrl())
                .statusName(b.getStatus() != null ? b.getStatus().getName() : null)
                .position(b.getPosition())
                .startDate(b.getStartDate())
                .endDate(b.getEndDate())
                .isPublished(b.getIsPublished())
                .build();
    }
}
