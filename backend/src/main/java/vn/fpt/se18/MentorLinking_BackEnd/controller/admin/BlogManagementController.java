package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.ModerateBlogRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BlogPageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BlogResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.BlogService;
import vn.fpt.se18.MentorLinking_BackEnd.service.UserService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/admin/blogs")
@RequiredArgsConstructor
@Tag(name = "Admin Blog Management Controller")
@Slf4j
public class BlogManagementController {

    private final BlogService blogService;
    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get all blogs for admin with search and pagination")
    public BaseResponse<BlogPageResponse> getAllBlogs(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        BlogPageResponse data = blogService.getAllBlogsForAdmin(keyword, status, sort, page, size);
        return BaseResponse.<BlogPageResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get all blogs successfully")
                .data(data)
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get blog by ID for admin management")
    public BaseResponse<BlogResponse> getBlogById(@PathVariable("id") Long id) {
        BlogResponse blog = blogService.getBlogById(id);
        

        return BaseResponse.<BlogResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get blog detail successfully")
                .data(blog)
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete blog")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public BaseResponse<Void> deleteBlog(@PathVariable("id") Long id) {
        blogService.deleteBlog(id);

        return BaseResponse.<Void>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Blog deleted successfully")
                .build();
    }

    @PostMapping("/{id}/moderate")
    @Operation(summary = "Moderate blog - change status (approve/reject/pending)")
    public BaseResponse<BlogResponse> moderateBlog(
            @PathVariable("id") Long id,
            @Valid @RequestBody ModerateBlogRequest request,
            Authentication authentication
    ) {

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        BlogResponse blog = blogService.moderateBlog(id, request, user.getId());

        return BaseResponse.<BlogResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Blog status changed successfully")
                .data(blog)
                .build();
    }

    @PostMapping("/{id}/toggle-publish")
    @Operation(summary = "Toggle blog publish status (show/hide)")
    public BaseResponse<BlogResponse> togglePublishStatus(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        BlogResponse blog = blogService.togglePublishStatus(id, currentUser.getId());

        return BaseResponse.<BlogResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Blog publish status toggled successfully")
                .data(blog)
                .build();
    }
}
