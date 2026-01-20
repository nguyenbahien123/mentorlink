package vn.fpt.se18.MentorLinking_BackEnd.service.admin;

import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.payment.PaymentFilterRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PaymentHistoryDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PaymentStatisticsResponse;

public interface PaymentManagementService {
    
    BaseResponse<PageResponse<PaymentHistoryDetailResponse>> getAllPayments(BaseRequest<PaymentFilterRequest> request);
    
    BaseResponse<PaymentHistoryDetailResponse> getPaymentById(Long id);
    
    BaseResponse<PaymentHistoryDetailResponse> getPaymentByTransactionCode(String transactionCode);
    
    BaseResponse<Void> markAsCompleted(Long id);
    
    BaseResponse<Void> markAsFailed(Long id, String reason);
    
    BaseResponse<Void> processRefund(Long id, String reason);
    
    BaseResponse<PaymentStatisticsResponse> getStatistics();
}
