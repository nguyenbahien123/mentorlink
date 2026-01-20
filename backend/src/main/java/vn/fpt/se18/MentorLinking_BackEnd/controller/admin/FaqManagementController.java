package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.FaqRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.FaqResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.AdminFaqService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/admin/faqs")
@RequiredArgsConstructor
@Tag(name = "Admin FAQ Management Controller")
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class FaqManagementController {

    private final AdminFaqService adminFaqService;

    @GetMapping
    @Operation(summary = "Get all FAQs for admin with pagination and filters")
    public BaseResponse<Page<FaqResponse>> getAllFaqs(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "published", required = false) Boolean published,
            @RequestParam(value = "urgency", required = false) String urgency,
            @RequestParam(value = "sort", defaultValue = "createdAt,desc") String sort,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Page<FaqResponse> data = adminFaqService.getAllFaqs(keyword, published, urgency, sort, page, size);
        
        return BaseResponse.<Page<FaqResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get all FAQs successfully")
                .data(data)
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get FAQ detail by ID")
    public BaseResponse<FaqResponse> getFaqById(@PathVariable Long id) {
        FaqResponse faq = adminFaqService.getFaqById(id);
        
        return BaseResponse.<FaqResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get FAQ detail successfully")
                .data(faq)
                .build();
    }

    @PostMapping
    @Operation(summary = "Create new FAQ")
    @ResponseStatus(HttpStatus.CREATED)
    public BaseResponse<FaqResponse> createFaq(
            @Valid @RequestBody FaqRequest request,
            Authentication authentication
    ) {
        FaqResponse faq = adminFaqService.createFaq(request, authentication.getName());
        
        return BaseResponse.<FaqResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("FAQ created successfully")
                .data(faq)
                .build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update FAQ")
    public BaseResponse<FaqResponse> updateFaq(
            @PathVariable Long id,
            @Valid @RequestBody FaqRequest request,
            Authentication authentication
    ) {
        FaqResponse faq = adminFaqService.updateFaq(id, request, authentication.getName());
        
        return BaseResponse.<FaqResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("FAQ updated successfully")
                .data(faq)
                .build();
    }

    @PatchMapping("/{id}/publish")
    @Operation(summary = "Toggle FAQ publish status")
    public BaseResponse<FaqResponse> togglePublishStatus(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean published
    ) {
        FaqResponse faq = adminFaqService.togglePublishStatus(id, published);
        String desc = published ? "FAQ published successfully" : "FAQ unpublished successfully";
        
        return BaseResponse.<FaqResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description(desc)
                .data(faq)
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete FAQ")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public BaseResponse<Void> deleteFaq(@PathVariable Long id) {
        adminFaqService.deleteFaq(id);
        
        return BaseResponse.<Void>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("FAQ deleted successfully")
                .build();
    }

    @PatchMapping("/{id}/answer")
    @Operation(summary = "Answer FAQ")
    public BaseResponse<FaqResponse> answerFaq(
            @PathVariable Long id,
            @RequestParam String answer,
            Authentication authentication
    ) {
        FaqResponse faq = adminFaqService.answerFaq(id, answer, authentication.getName());
        
        return BaseResponse.<FaqResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("FAQ answered successfully")
                .data(faq)
                .build();
    }
}
