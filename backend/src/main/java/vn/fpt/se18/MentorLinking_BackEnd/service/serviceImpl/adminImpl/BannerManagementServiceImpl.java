package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl.adminImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.banner.BannerCreateRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.banner.BannerFilterRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.banner.BannerUpdateRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.BannerDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.BannerStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Banner;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.BannerRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.BannerManagementService;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BannerManagementServiceImpl implements BannerManagementService {

    private final BannerRepository bannerRepository;
    private final StatusRepository statusRepository;
    private final UserRepository userRepository;

    @Override
    public BaseResponse<PageResponse<BannerDetailResponse>> getAllBanners(BaseRequest<BannerFilterRequest> request) {
        BannerFilterRequest filter = request.getData();
        
        log.info("Fetching banners with filters - keySearch: {}, status: {}, isPublished: {}, dateFrom: {}, dateTo: {}, page: {}, size: {}", 
                filter.getKeySearch(), filter.getStatus(), filter.getIsPublished(), 
                filter.getDateFrom(), filter.getDateTo(), filter.getPage(), filter.getSize());
        
        Pageable pageable = PageRequest.of(
                filter.getPage() - 1,
                filter.getSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<Banner> bannerPage = bannerRepository.findAllWithCondition(
                filter.getKeySearch(),
                filter.getStatus(),
                filter.getIsPublished(),
                filter.getDateFrom(),
                filter.getDateTo(),
                pageable
        );
        
        log.info("Found {} banners, total: {}", bannerPage.getContent().size(), bannerPage.getTotalElements());

        List<BannerDetailResponse> bannerList = bannerPage.getContent().stream()
                .map(this::convertToDetailResponse)
                .toList();

        PageResponse<BannerDetailResponse> pageResponse = PageResponse.<BannerDetailResponse>builder()
                .content(bannerList)
                .totalPages(bannerPage.getTotalPages())
                .totalElements(bannerPage.getTotalElements())
                .currentPage(filter.getPage())
                .pageSize(filter.getSize())
                .build();

        return BaseResponse.<PageResponse<BannerDetailResponse>>builder()
                .respCode("0")
                .description("Lấy danh sách banner thành công")
                .data(pageResponse)
                .build();
    }

    @Override
    public BaseResponse<BannerDetailResponse> getBannerById(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BANNER_NOT_EXISTED));

        return BaseResponse.<BannerDetailResponse>builder()
                .respCode("0")
                .description("Lấy thông tin banner thành công")
                .data(convertToDetailResponse(banner))
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<BannerDetailResponse> createBanner(BaseRequest<BannerCreateRequest> request) {
        BannerCreateRequest data = request.getData();
        User currentUser = getCurrentUser();

        Status defaultStatus = statusRepository.findByName("PENDING")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_EXISTED));

        Banner banner = Banner.builder()
                .title(data.getTitle())
                .imageUrl(data.getImageUrl())
                .linkUrl(data.getLinkUrl())
                .position(data.getPosition())
                .startDate(data.getStartDate())
                .endDate(data.getEndDate())
                .isPublished(data.getIsPublished())
                .status(defaultStatus)
                .viewCount(0)
                .clickCount(0)
                .createdBy(currentUser)
                .build();

        banner.setCreatedAt(LocalDateTime.now());
        Banner savedBanner = bannerRepository.save(banner);

        return BaseResponse.<BannerDetailResponse>builder()
                .respCode("0")
                .description("Tạo banner thành công")
                .data(convertToDetailResponse(savedBanner))
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<BannerDetailResponse> updateBanner(Long id, BaseRequest<BannerUpdateRequest> request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BANNER_NOT_EXISTED));
        
        BannerUpdateRequest data = request.getData();
        User currentUser = getCurrentUser();

        if (data.getTitle() != null) {
            banner.setTitle(data.getTitle());
        }
        if (data.getImageUrl() != null) {
            banner.setImageUrl(data.getImageUrl());
        }
        if (data.getLinkUrl() != null) {
            banner.setLinkUrl(data.getLinkUrl());
        }
        if (data.getPosition() != null) {
            banner.setPosition(data.getPosition());
        }
        if (data.getStartDate() != null) {
            banner.setStartDate(data.getStartDate());
        }
        if (data.getEndDate() != null) {
            banner.setEndDate(data.getEndDate());
        }
        if (data.getIsPublished() != null) {
            banner.setIsPublished(data.getIsPublished());
        }

        banner.setUpdatedBy(currentUser);
        banner.setUpdatedAt(LocalDateTime.now());

        Banner updatedBanner = bannerRepository.save(banner);

        return BaseResponse.<BannerDetailResponse>builder()
                .respCode("0")
                .description("Cập nhật banner thành công")
                .data(convertToDetailResponse(updatedBanner))
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<Void> deleteBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BANNER_NOT_EXISTED));

        bannerRepository.delete(banner);

        return BaseResponse.<Void>builder()
                .respCode("0")
                .description("Xóa banner thành công")
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<Void> publishBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BANNER_NOT_EXISTED));

        banner.setIsPublished(true);
        
        Status activeStatus = statusRepository.findByName("ACTIVE")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_EXISTED));
        banner.setStatus(activeStatus);
        
        banner.setUpdatedBy(getCurrentUser());
        banner.setUpdatedAt(LocalDateTime.now());

        bannerRepository.save(banner);

        return BaseResponse.<Void>builder()
                .respCode("0")
                .description("Xuất bản banner thành công")
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<Void> unpublishBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BANNER_NOT_EXISTED));

        banner.setIsPublished(false);
        
        Status inactiveStatus = statusRepository.findByName("INACTIVE")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_EXISTED));
        banner.setStatus(inactiveStatus);
        
        banner.setUpdatedBy(getCurrentUser());
        banner.setUpdatedAt(LocalDateTime.now());

        bannerRepository.save(banner);

        return BaseResponse.<Void>builder()
                .respCode("0")
                .description("Hủy xuất bản banner thành công")
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<Void> updateBannerStatus(Long id, String statusName) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BANNER_NOT_EXISTED));

        Status status = statusRepository.findByName(statusName)
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_EXISTED));

        banner.setStatus(status);
        banner.setUpdatedBy(getCurrentUser());
        banner.setUpdatedAt(LocalDateTime.now());

        bannerRepository.save(banner);

        return BaseResponse.<Void>builder()
                .respCode("0")
                .description("Cập nhật trạng thái banner thành công")
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<Void> bulkDeleteBanners(List<Long> ids) {
        List<Banner> banners = bannerRepository.findAllById(ids);
        
        if (banners.isEmpty()) {
            throw new AppException(ErrorCode.BANNER_NOT_EXISTED);
        }

        bannerRepository.deleteAll(banners);

        return BaseResponse.<Void>builder()
                .respCode("0")
                .description("Xóa banner hàng loạt thành công")
                .build();
    }

    @Override
    public BaseResponse<BannerStatisticsResponse> getStatistics() {
        Integer totalBanners = (int) bannerRepository.count();
        Integer activeBanners = bannerRepository.countByStatusName("ACTIVE");
        Integer inactiveBanners = bannerRepository.countByStatusName("INACTIVE");
        Integer pendingBanners = bannerRepository.countByStatusName("PENDING");
        Integer expiredBanners = bannerRepository.countByStatusName("EXPIRED");
        
        Long totalViews = bannerRepository.sumViewCount();
        Long totalClicks = bannerRepository.sumClickCount();
        Double averageCTR = totalViews > 0 ? (totalClicks.doubleValue() / totalViews.doubleValue()) * 100 : 0.0;

        BannerStatisticsResponse statistics = BannerStatisticsResponse.builder()
                .totalBanners(totalBanners)
                .activeBanners(activeBanners != null ? activeBanners : 0)
                .inactiveBanners(inactiveBanners != null ? inactiveBanners : 0)
                .pendingBanners(pendingBanners != null ? pendingBanners : 0)
                .expiredBanners(expiredBanners != null ? expiredBanners : 0)
                .totalViews(totalViews)
                .totalClicks(totalClicks)
                .averageCTR(averageCTR)
                .build();

        return BaseResponse.<BannerStatisticsResponse>builder()
                .respCode("0")
                .description("Lấy thống kê banner thành công")
                .data(statistics)
                .build();
    }

    private BannerDetailResponse convertToDetailResponse(Banner banner) {
        return BannerDetailResponse.builder()
                .id(banner.getId())
                .title(banner.getTitle())
                .imageUrl(banner.getImageUrl())
                .linkUrl(banner.getLinkUrl())
                .position(banner.getPosition())
                .status(banner.getStatus() != null ? banner.getStatus().getName() : null)
                .startDate(banner.getStartDate())
                .endDate(banner.getEndDate())
                .isPublished(banner.getIsPublished())
                .viewCount(banner.getViewCount() != null ? banner.getViewCount() : 0)
                .clickCount(banner.getClickCount() != null ? banner.getClickCount() : 0)
                .createdBy(banner.getCreatedBy() != null ? banner.getCreatedBy().getFullname() : null)
                .createdAt(banner.getCreatedAt())
                .updatedBy(banner.getUpdatedBy() != null ? banner.getUpdatedBy().getFullname() : null)
                .updatedAt(banner.getUpdatedAt())
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}
