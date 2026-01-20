package vn.fpt.se18.MentorLinking_BackEnd.service.admin;

import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.review.ReviewFilterRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.ReviewDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.ReviewStatisticsResponse;

public interface ReviewManagementService {
    
    BaseResponse<PageResponse<ReviewDetailResponse>> getAllReviews(BaseRequest<ReviewFilterRequest> request);
    
    BaseResponse<ReviewDetailResponse> getReviewById(Long id);
    
    BaseResponse<Void> publishReview(Long id);
    
    BaseResponse<Void> unpublishReview(Long id);
    
    BaseResponse<Void> deleteReview(Long id);
    
    BaseResponse<Void> updateModerationNote(Long id, String note);
    
    BaseResponse<Void> bulkPublish(Long[] ids);
    
    BaseResponse<Void> bulkDelete(Long[] ids);
    
    BaseResponse<ReviewStatisticsResponse> getStatistics();
}
