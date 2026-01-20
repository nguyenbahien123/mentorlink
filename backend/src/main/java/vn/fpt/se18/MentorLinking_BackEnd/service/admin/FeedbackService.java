package vn.fpt.se18.MentorLinking_BackEnd.service.admin;

import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.feedback.FeedbackFilterRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.feedback.FeedbackResponseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.FeedbackDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.FeedbackStatisticsResponse;

import java.util.List;

@Service
public interface FeedbackService {
    BaseResponse<PageResponse<FeedbackDetailResponse>> getAllFeedbacks(BaseRequest<FeedbackFilterRequest> request);
    
    BaseResponse<FeedbackDetailResponse> getFeedbackById(Long id);
    
    BaseResponse<Void> respondToFeedback(Long id, FeedbackResponseRequest request);
    
    BaseResponse<Void> markInProgress(Long id);
    
    BaseResponse<Void> markResolved(Long id);
    
    BaseResponse<Void> rejectFeedback(Long id);
    
    BaseResponse<Void> deleteFeedback(Long id);
    
    BaseResponse<Void> bulkResolveFeedbacks(List<Long> feedbackIds);
    
    BaseResponse<FeedbackStatisticsResponse> getStatistics();
}
