package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.ModerateBlogRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.CreateBlogRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.UpdateBlogRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BlogPageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BlogResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Blog;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.BlogRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.BlogService;

import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogServiceImpl implements BlogService {

    private final BlogRepository blogRepository;
    private final UserRepository userRepository;
    private final StatusRepository statusRepository;
    private static final String APPROVED_STATUS = "Approved";
    private static final String PENDING_STATUS = "Pending";

    @Override
    @Transactional(readOnly = true)
    public BlogPageResponse getBlogs(String keyword, String sort, int page, int size) {
        // default order: createdAt desc
        Sort.Order order = new Sort.Order(Sort.Direction.DESC, "createdAt");

        if (StringUtils.hasLength(sort)) {
            Pattern pattern = Pattern.compile("^(\\w+):(asc|desc)$", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(sort);
            if (matcher.find()) {
                String columnName = matcher.group(1);
                if (matcher.group(2).equalsIgnoreCase("asc")) {
                    order = new Sort.Order(Sort.Direction.ASC, columnName);
                } else {
                    order = new Sort.Order(Sort.Direction.DESC, columnName);
                }
            }
        }

        int pageNo = 0;
        if (page > 0) pageNo = page - 1;

        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(order));

        Page<Blog> entityPage;

        if (StringUtils.hasLength(keyword)) {
            String kw = "%" + keyword.toLowerCase() + "%";
            entityPage = blogRepository.searchByKeywordAndStatusAndPublished(kw, APPROVED_STATUS, Boolean.TRUE, pageable);
        } else {
            entityPage = blogRepository.findByStatus_NameAndIsPublished(APPROVED_STATUS, Boolean.TRUE, pageable);
        }

        List<BlogResponse> blogResponses = entityPage.stream().map(this::toResponse).collect(Collectors.toList());

        BlogPageResponse pageResponse = new BlogPageResponse();
        pageResponse.setPageNumber(entityPage.getNumber());
        pageResponse.setPageSize(entityPage.getSize());
        pageResponse.setTotalElements(entityPage.getTotalElements());
        pageResponse.setTotalPages(entityPage.getTotalPages());
        pageResponse.setBlogs(blogResponses);

        return pageResponse;
    }

    @Override
    @Transactional(readOnly = true)
    public BlogPageResponse getAllBlogsForAdmin(String keyword, String status, String sort, int page, int size) {
        Sort.Order order = new Sort.Order(Sort.Direction.DESC, "createdAt");

        if (StringUtils.hasLength(sort)) {
            Pattern pattern = Pattern.compile("^(\\w+):(asc|desc)$", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(sort);
            if (matcher.find()) {
                String columnName = matcher.group(1);
                if (matcher.group(2).equalsIgnoreCase("asc")) {
                    order = new Sort.Order(Sort.Direction.ASC, columnName);
                } else {
                    order = new Sort.Order(Sort.Direction.DESC, columnName);
                }
            }
        }

        int pageNo = 0;
        if (page > 0) pageNo = page - 1;

        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(order));

        String kw = null;
        if (StringUtils.hasLength(keyword)) {
            kw = "%" + keyword.toLowerCase() + "%";
        }

        Page<Blog> entityPage = blogRepository.findAllBlogsForAdmin(kw, status, pageable);
        List<BlogResponse> blogResponses = entityPage.stream().map(this::toResponse).collect(Collectors.toList());

        BlogPageResponse pageResponse = new BlogPageResponse();
        pageResponse.setPageNumber(entityPage.getNumber());
        pageResponse.setPageSize(entityPage.getSize());
        pageResponse.setTotalElements(entityPage.getTotalElements());
        pageResponse.setTotalPages(entityPage.getTotalPages());
        pageResponse.setBlogs(blogResponses);

        return pageResponse;
    }

    @Override
    @Transactional
    public BlogResponse getBlogById(Long id) {
        Optional<Blog> optionalBlog = blogRepository.findById(id);
        Blog blog = optionalBlog.orElseThrow(() -> new AppException(ErrorCode.INVALID_ENDPOINT, "Blog not found"));


        // increment view count safely
        if (blog.getViewCount() == null) blog.setViewCount(1);
        else blog.setViewCount(blog.getViewCount() + 1);
        blogRepository.save(blog);

        return toResponse(blog);
    }

    @Override
    @Transactional
    public void deleteBlog(Long id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_ENDPOINT, "Blog not found"));

        blogRepository.delete(blog);
    }

    @Override
    @Transactional
    public BlogResponse moderateBlog(Long blogId, ModerateBlogRequest request, Long moderatorId) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_ENDPOINT, "Blog not found"));

        User moderator = userRepository.findById(moderatorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED, "Moderator not found"));

        Status decision = statusRepository.findById(request.getDecisionId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_ENDPOINT, "Decision status not found"));

        // Update blog status
        blog.setStatus(decision);
        blog.setUpdatedBy(moderator);

        Blog savedBlog = blogRepository.save(blog);

        return toResponse(savedBlog);
    }

    @Override
    @Transactional
    public BlogResponse togglePublishStatus(Long id, Long updatedBy) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_ENDPOINT, "Blog not found"));

        User updater = userRepository.findById(updatedBy)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED, "User not found"));

        blog.setIsPublished(!blog.getIsPublished());
        blog.setUpdatedBy(updater);

        Blog savedBlog = blogRepository.save(blog);
        return toResponse(savedBlog);
    }

    @Override
    @Transactional
    public BlogResponse createBlog(CreateBlogRequest request, Long authorId) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED, "Author not found"));

        // Automatically set status to PENDING when creating a blog
        Status status = statusRepository.findByName(PENDING_STATUS)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_ENDPOINT, "Pending status not found in system"));

        Blog blog = Blog.builder()
                .author(author)
                .title(request.getTitle())
                .content(request.getContent())
                .status(status)
                .viewCount(0)
                .isPublished(request.getIsPublished() != null ? request.getIsPublished() : false)
                .createdBy(author)
                .build();

        Blog savedBlog = blogRepository.save(blog);
        log.info("Blog created successfully with ID: {} and status: PENDING", savedBlog.getId());

        return toResponse(savedBlog);
    }

    @Override
    @Transactional
    public BlogResponse updateBlog(Long blogId, UpdateBlogRequest request, Long authorId) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_ENDPOINT, "Blog not found"));

        User updater = userRepository.findById(authorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED, "User not found"));

        // Automatically set status to PENDING when updating a blog
        Status status = statusRepository.findByName(PENDING_STATUS)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_ENDPOINT, "Pending status not found in system"));

        // Only author or admin can update the blog
        if (!blog.getAuthor().getId().equals(authorId)) {
            throw new AppException(ErrorCode.INVALID_ENDPOINT, "Only author can update this blog");
        }

        blog.setTitle(request.getTitle());
        blog.setContent(request.getContent());
        blog.setStatus(status);
        if (request.getIsPublished() != null) {
            blog.setIsPublished(request.getIsPublished());
        }
        blog.setUpdatedBy(updater);

        Blog savedBlog = blogRepository.save(blog);
        log.info("Blog updated successfully with ID: {} and status reset to: PENDING", savedBlog.getId());

        return toResponse(savedBlog);
    }

    @Override
    @Transactional(readOnly = true)
    public BlogPageResponse getBlogsByAuthorId(Long authorId, String keyword, String sort, int page, int size) {
        // Verify author exists
        userRepository.findById(authorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED, "Author not found"));

        Sort.Order order = new Sort.Order(Sort.Direction.DESC, "createdAt");

        if (StringUtils.hasLength(sort)) {
            Pattern pattern = Pattern.compile("^(\\w+):(asc|desc)$", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(sort);
            if (matcher.find()) {
                String columnName = matcher.group(1);
                if (matcher.group(2).equalsIgnoreCase("asc")) {
                    order = new Sort.Order(Sort.Direction.ASC, columnName);
                } else {
                    order = new Sort.Order(Sort.Direction.DESC, columnName);
                }
            }
        }

        int pageNo = 0;
        if (page > 0) pageNo = page - 1;

        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(order));

        Page<Blog> entityPage;

        if (StringUtils.hasLength(keyword)) {
            String kw = "%" + keyword.toLowerCase() + "%";
            entityPage = blogRepository.findByAuthorIdAndKeyword(authorId, kw, pageable);
        } else {
            entityPage = blogRepository.findByAuthorId(authorId, pageable);
        }

        List<BlogResponse> blogResponses = entityPage.stream().map(this::toResponse).collect(Collectors.toList());

        BlogPageResponse pageResponse = new BlogPageResponse();
        pageResponse.setPageNumber(entityPage.getNumber());
        pageResponse.setPageSize(entityPage.getSize());
        pageResponse.setTotalElements(entityPage.getTotalElements());
        pageResponse.setTotalPages(entityPage.getTotalPages());
        pageResponse.setBlogs(blogResponses);

        return pageResponse;
    }

    private BlogResponse toResponse(Blog b) {
        if (b == null) return null;
        String authorName = null;
        if (b.getAuthor() != null) {
            if (b.getAuthor().getFullname() != null) authorName = b.getAuthor().getFullname();
            else authorName = b.getAuthor().getUsername();
        }

        return BlogResponse.builder()
                .id(b.getId())
                .author(authorName)
                .title(b.getTitle())
                .content(b.getContent())
                .statusName(b.getStatus() != null ? b.getStatus().getName() : null)
                .viewCount(b.getViewCount() == null ? 0 : b.getViewCount())
                .isPublished(b.getIsPublished())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
