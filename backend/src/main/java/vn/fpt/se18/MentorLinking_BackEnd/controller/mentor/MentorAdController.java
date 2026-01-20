package vn.fpt.se18.MentorLinking_BackEnd.controller.mentor;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor.MentorAdUploadRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorAdResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorAdService;

import java.io.IOException;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/mentor-ads")
@RequiredArgsConstructor
public class MentorAdController {

    private final MentorAdService adService;

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public BaseResponse<MentorAdResponse> uploadAd(
            @RequestPart("data") MentorAdUploadRequest request,
            @RequestPart("image") MultipartFile file,
            @AuthenticationPrincipal User mentorPrincipal) throws IOException {

        MentorAdResponse response = adService.uploadAd(mentorPrincipal.getEmail(), request, file);

        return BaseResponse.<MentorAdResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Ad uploaded successfully, pending review")
                .data(response)
                .build();
    }

    @GetMapping("/my-ads")
    public BaseResponse<Page<MentorAdResponse>> getMyAds(
            @AuthenticationPrincipal User mentorPrincipal,
            @PageableDefault(size = 5, sort = "createdAt,desc") Pageable pageable) {

        return BaseResponse.<Page<MentorAdResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get my ads successfully")
                .data(adService.getMyAds(mentorPrincipal.getEmail(), pageable))
                .build();
    }
}