package vn.fpt.se18.MentorLinking_BackEnd.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BannerResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.BannerService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/banners")
@RequiredArgsConstructor
@Tag(name = "Banner Controller")
@Slf4j
public class BannerController {

    private final BannerService bannerService;

    @GetMapping("/top5")
    public BaseResponse<List<BannerResponse>> getTop5Banners() {
        List<BannerResponse> banners = bannerService.getTop5ActivePublished();
        return BaseResponse.<List<BannerResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get top 5 banners successfully")
                .data(banners)
                .build();
    }
}
