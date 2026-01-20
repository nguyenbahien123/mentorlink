package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.MentorAdReviewRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor.MentorAdUploadRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorAdResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorAd;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.enums.BannerStatus;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorAdRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.ImageUploadService;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorAdService;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MentorAdServiceImpl implements MentorAdService {

    private final MentorAdRepository adRepository;
    private final ImageUploadService imageUploadService;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MentorAdResponse> getActivePublicAds() {
        return adRepository.findByStatusAndIsPublishedTrueOrderByPositionAsc(BannerStatus.APPROVED)
                .stream()
                .map(MentorAdResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MentorAdResponse> getMyAds(String mentorEmail, Pageable pageable) {
        User mentor = userRepository.findByEmail(mentorEmail)
                .orElseThrow();
        return adRepository.findByMentor(mentor, pageable).map(MentorAdResponse::fromEntity);
    }

    @Override
    public MentorAdResponse uploadAd(String mentorEmail, MentorAdUploadRequest request, MultipartFile file) throws IOException {
        User mentor = userRepository.findByEmail(mentorEmail)
                .orElseThrow();

        String imageUrl = imageUploadService.uploadImage(file, "mentor_ads");

        MentorAd ad = MentorAd.builder()
                .title(request.getTitle())
                .imageUrl(imageUrl)
                .linkUrl(request.getLinkUrl())
                .mentor(mentor)
                .status(BannerStatus.PENDING)
                .isPublished(false)
                .position(0)
                .viewCount(0)
                .clickCount(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return MentorAdResponse.fromEntity(adRepository.save(ad));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MentorAdResponse> getAdsForAdmin(String statusName, Pageable pageable) {
        BannerStatus status = BannerStatus.valueOf(statusName.toUpperCase());
        return adRepository.findByStatus(status, pageable).map(MentorAdResponse::fromEntity);
    }

    @Override
    public MentorAdResponse reviewAd(Long adId, MentorAdReviewRequest request, User admin) {
        MentorAd ad = adRepository.findById(adId)
                .orElseThrow();

        BannerStatus newStatus = BannerStatus.valueOf(request.getStatusName().toUpperCase());

        ad.setStatus(newStatus);
        ad.setReviewedBy(admin);
        ad.setIsPublished(request.getIsPublished());
        ad.setPosition(request.getPosition());

        if (newStatus == BannerStatus.REJECTED) {
            ad.setRejectionReason(request.getRejectionReason());
        } else {
            ad.setRejectionReason(null);
        }
        return MentorAdResponse.fromEntity(adRepository.save(ad));
    }

    @Override
    public void deleteAd(Long adId) {
        adRepository.deleteById(adId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getAdminStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("PENDING", adRepository.countByStatus(BannerStatus.PENDING));
        stats.put("APPROVED", adRepository.countByStatus(BannerStatus.APPROVED));
        stats.put("REJECTED", adRepository.countByStatus(BannerStatus.REJECTED));
        return stats;
    }
}