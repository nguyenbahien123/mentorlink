package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor.MentorEducationRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorEducationResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface MentorEducationService {
    MentorEducationResponse createMentorEducation(Long mentorId, MentorEducationRequest request);
    MentorEducationResponse getMentorEducationById(Long educationId);
    List<MentorEducationResponse> getMentorEducationsByMentorId(Long mentorId);
    Page<MentorEducationResponse> getMentorEducationsPaginated(Long mentorId, int page, int size);
    MentorEducationResponse updateMentorEducation(Long educationId, Long mentorId, MentorEducationRequest request);
    void deleteMentorEducation(Long educationId, Long mentorId);
    List<MentorEducationResponse> getEducationsByMentorAndStatus(Long mentorId, String statusCode);
    List<MentorEducationResponse> getAllApprovedEducations();
    MentorEducationResponse approveEducation(Long educationId);
    MentorEducationResponse rejectEducation(Long educationId);
}

