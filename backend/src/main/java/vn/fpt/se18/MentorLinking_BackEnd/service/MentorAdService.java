package vn.fpt.se18.MentorLinking_BackEnd.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.MentorAdReviewRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor.MentorAdUploadRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorAdResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface MentorAdService {
    List<MentorAdResponse> getActivePublicAds();

    Page<MentorAdResponse> getMyAds(String mentorEmail, Pageable pageable);

    MentorAdResponse uploadAd(String mentorEmail, MentorAdUploadRequest request, MultipartFile file) throws IOException;

    Page<MentorAdResponse> getAdsForAdmin(String statusName, Pageable pageable);

    MentorAdResponse reviewAd(Long adId, MentorAdReviewRequest request, User admin);

    void deleteAd(Long adId);

    Map<String, Long> getAdminStats();
}