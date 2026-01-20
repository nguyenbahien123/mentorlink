package vn.fpt.se18.MentorLinking_BackEnd.service.admin;

import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.user.GetMentorRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.user.MentorManagementResponse;

import java.util.List;

@Service
public interface MentorService {
    List<MentorManagementResponse> getAllMentors();

    BaseResponse<PageResponse<MentorManagementResponse>> getAllMentorsWithCondition(BaseRequest<GetMentorRequest> request);

    BaseResponse<MentorManagementResponse> getMentorById(Long id);

    BaseResponse<Void> approveMentor(Long id);

    BaseResponse<Void> rejectMentor(Long id);

    BaseResponse<Void> bulkApproveMentors(List<Long> mentorIds);

    BaseResponse<Void> bulkRejectMentors(List<Long> mentorIds);

    BaseResponse<Void> deleteMentor(Long id);

    BaseResponse<MentorStatisticsResponse> getMentorStatistics();

    BaseResponse<?> getMentorEducation(Long id);

    BaseResponse<?> getMentorExperience(Long id);

    BaseResponse<?> getMentorCertificates(Long id);

    BaseResponse<?> getMentorServices(Long id);

    BaseResponse<?> getMentorCountries(Long id);
}
