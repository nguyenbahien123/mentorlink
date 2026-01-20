package vn.fpt.se18.MentorLinking_BackEnd.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorCountryResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorCountryService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/mentor-countries")
@RequiredArgsConstructor
@Tag(name = "Mentor Country Controller")
@Slf4j
public class MentorCountryController {

    private final MentorCountryService mentorCountryService;

    @GetMapping("/approved")
    public BaseResponse<List<MentorCountryResponse>> getApprovedMentorCountries() {
        List<MentorCountryResponse> data = mentorCountryService.getAllApprovedMentorCountries();
        return BaseResponse.<List<MentorCountryResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get approved mentor countries successfully")
                .data(data)
                .build();
    }
}
