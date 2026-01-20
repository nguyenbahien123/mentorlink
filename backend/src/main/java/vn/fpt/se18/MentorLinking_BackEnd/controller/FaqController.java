package vn.fpt.se18.MentorLinking_BackEnd.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.FaqRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.FaqResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.FaqService;

import jakarta.validation.Valid;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/faqs")
@RequiredArgsConstructor
@Tag(name = "FAQ Controller")
@Slf4j
public class FaqController {

    private final FaqService faqService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public BaseResponse<FaqResponse> createFaq(@Valid @RequestBody FaqRequest request) {
        FaqResponse response = faqService.createFaq(request);
        return BaseResponse.<FaqResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("FAQ created successfully")
                .data(response)
                .build();
    }

    @PatchMapping("/{id}/publish")
    public BaseResponse<FaqResponse> publishFaq(@PathVariable Long id, @RequestParam(defaultValue = "true") boolean published) {
        FaqResponse response = faqService.publishFaq(id, published);
        String desc = published ? "FAQ published successfully" : "FAQ unpublished successfully";
        return BaseResponse.<FaqResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description(desc)
                .data(response)
                .build();
    }

    @GetMapping("/published")
    public BaseResponse<Page<FaqResponse>> getPublishedFaqs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort
    ) {
        Page<FaqResponse> pageResult = faqService.getPublishedFaqs(page, size, sort);

        return BaseResponse.<Page<FaqResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get published FAQs successfully")
                .data(pageResult)
                .build();
    }

    @GetMapping("/{id}")
    public BaseResponse<FaqResponse> getFaqDetail(@PathVariable Long id) {
        FaqResponse response = faqService.getFaqDetail(id);
        return BaseResponse.<FaqResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get FAQ detail successfully")
                .data(response)
                .build();
    }
}
