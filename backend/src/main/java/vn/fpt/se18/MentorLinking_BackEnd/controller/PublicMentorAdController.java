package vn.fpt.se18.MentorLinking_BackEnd.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorAdResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorAdService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/public/mentor-ads")
@RequiredArgsConstructor
public class PublicMentorAdController {

    private final MentorAdService adService;

    @GetMapping("/active")
    public BaseResponse<List<MentorAdResponse>> getActivePublicAds() {
        return BaseResponse.<List<MentorAdResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get active mentor ads successfully")
                .data(adService.getActivePublicAds())
                .build();
    }
}