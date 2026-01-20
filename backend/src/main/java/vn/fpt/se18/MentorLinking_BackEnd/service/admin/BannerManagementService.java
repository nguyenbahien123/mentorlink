package vn.fpt.se18.MentorLinking_BackEnd.service.admin;

import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.banner.BannerCreateRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.banner.BannerFilterRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.banner.BannerUpdateRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.BannerDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.BannerStatisticsResponse;

import java.util.List;

public interface BannerManagementService {
    BaseResponse<PageResponse<BannerDetailResponse>> getAllBanners(BaseRequest<BannerFilterRequest> request);
    
    BaseResponse<BannerDetailResponse> getBannerById(Long id);
    
    BaseResponse<BannerDetailResponse> createBanner(BaseRequest<BannerCreateRequest> request);
    
    BaseResponse<BannerDetailResponse> updateBanner(Long id, BaseRequest<BannerUpdateRequest> request);
    
    BaseResponse<Void> deleteBanner(Long id);
    
    BaseResponse<Void> publishBanner(Long id);
    
    BaseResponse<Void> unpublishBanner(Long id);
    
    BaseResponse<Void> updateBannerStatus(Long id, String status);
    
    BaseResponse<Void> bulkDeleteBanners(List<Long> ids);
    
    BaseResponse<BannerStatisticsResponse> getStatistics();
}
