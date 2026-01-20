package vn.fpt.se18.MentorLinking_BackEnd.service.admin;

import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.booking.BookingFilterRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.BookingDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.BookingStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.ScheduleDetailResponse;

import java.util.List;

public interface BookingManagementService {
    
    // Booking operations
    BaseResponse<PageResponse<BookingDetailResponse>> getAllBookings(BaseRequest<BookingFilterRequest> request);
    
    BaseResponse<BookingDetailResponse> getBookingById(Long id);
    
    BaseResponse<Void> confirmBooking(Long id);
    
    BaseResponse<Void> cancelBooking(Long id, String reason);
    
    BaseResponse<Void> completeBooking(Long id);
    
    BaseResponse<Void> bulkConfirmBookings(List<Long> bookingIds);
    
    BaseResponse<Void> bulkCancelBookings(List<Long> bookingIds, String reason);
    
    BaseResponse<BookingStatisticsResponse> getStatistics();
    
    // Schedule operations
    BaseResponse<PageResponse<ScheduleDetailResponse>> getAllSchedules(BaseRequest<BookingFilterRequest> request);
    
    BaseResponse<List<ScheduleDetailResponse>> getSchedulesByMentor(Long mentorId);
}
