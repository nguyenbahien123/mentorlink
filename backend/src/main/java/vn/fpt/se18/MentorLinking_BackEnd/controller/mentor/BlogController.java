package vn.fpt.se18.MentorLinking_BackEnd.controller.mentor;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.CreateBlogRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.UpdateBlogRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BlogPageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BlogResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.BlogService;
import jakarta.validation.Valid;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/blogs")
@RequiredArgsConstructor
@Tag(name = "Blog Controller")
@Slf4j
public class BlogController {

    private final BlogService blogService;

    @GetMapping("/approved")
    public BaseResponse<BlogPageResponse> getBlogs(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        BlogPageResponse data = blogService.getBlogs(keyword, sort, page, size);
        return BaseResponse.<BlogPageResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get blogs successfully")
                .data(data)
                .build();
    }

    @GetMapping("/{id}")
    public BaseResponse<BlogResponse> getBlogDetail(@PathVariable("id") Long id) {
        BlogResponse blog = blogService.getBlogById(id);
        return BaseResponse.<BlogResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get blog detail successfully")
                .data(blog)
                .build();
    }

    @PostMapping
    public BaseResponse<BlogResponse> createBlog(
            @Valid @RequestBody CreateBlogRequest request,
            @RequestParam(value = "authorId") Long authorId
    ) {
        BlogResponse blog = blogService.createBlog(request, authorId);
        return BaseResponse.<BlogResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Blog created successfully with PENDING status")
                .data(blog)
                .build();
    }

    @PutMapping("/{id}")
    public BaseResponse<BlogResponse> updateBlog(
            @PathVariable("id") Long blogId,
            @Valid @RequestBody UpdateBlogRequest request,
            @RequestParam(value = "authorId") Long authorId
    ) {
        BlogResponse blog = blogService.updateBlog(blogId, request, authorId);
        return BaseResponse.<BlogResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Blog updated successfully and status reset to PENDING")
                .data(blog)
                .build();
    }

    @GetMapping("/mentor/{authorId}")
    public BaseResponse<BlogPageResponse> getBlogsByMentor(
            @PathVariable("authorId") Long authorId,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        BlogPageResponse data = blogService.getBlogsByAuthorId(authorId, keyword, sort, page, size);
        return BaseResponse.<BlogPageResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get mentor's blogs successfully")
                .data(data)
                .build();
    }
}
