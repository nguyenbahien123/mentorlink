package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.MentorAdReviewRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorAdResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorAdService;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/admin/mentor-ads")
@RequiredArgsConstructor
public class AdminMentorAdController {

    private final MentorAdService adService;

    @GetMapping
    public BaseResponse<Page<MentorAdResponse>> getAdsForAdmin(
            @RequestParam(defaultValue = "PENDING") String status,
            @PageableDefault(size = 10) Pageable pageable) {

        return BaseResponse.<Page<MentorAdResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get ads by status successfully")
                .data(adService.getAdsForAdmin(status, pageable))
                .build();
    }

    @PatchMapping("/{id}/review")
    public BaseResponse<MentorAdResponse> reviewAd(
            @PathVariable Long id,
            @RequestBody MentorAdReviewRequest request,
            @AuthenticationPrincipal User admin) {

        return BaseResponse.<MentorAdResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Ad review updated successfully")
                .data(adService.reviewAd(id, request, admin))
                .build();
    }

    @GetMapping("/stats")
    public BaseResponse<Map<String, Long>> getAdminStats() {
        return BaseResponse.<Map<String, Long>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get ad stats successfully")
                .data(adService.getAdminStats())
                .build();
    }
}