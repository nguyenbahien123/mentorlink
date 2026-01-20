package vn.fpt.se18.MentorLinking_BackEnd.service;

import org.springframework.data.domain.Page;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor.MentorExperienceRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorExperienceResponse;

import java.util.List;

public interface MentorExperienceService {
    MentorExperienceResponse createMentorExperience(Long mentorId, MentorExperienceRequest request);
    MentorExperienceResponse getMentorExperienceById(Long experienceId);
    List<MentorExperienceResponse> getMentorExperiencesByMentorId(Long mentorId);
    Page<MentorExperienceResponse> getMentorExperiencesPaginated(Long mentorId, int page, int size);
    MentorExperienceResponse updateMentorExperience(Long experienceId, Long mentorId, MentorExperienceRequest request);
    void deleteMentorExperience(Long experienceId, Long mentorId);
    List<MentorExperienceResponse> getExperiencesByMentorAndStatus(Long mentorId, String statusCode);
    List<MentorExperienceResponse> getAllApprovedExperiences();
    List<MentorExperienceResponse> getApprovedByMentorId(Long mentorId);
    MentorExperienceResponse approveExperience(Long experienceId);
    MentorExperienceResponse rejectExperience(Long experienceId);
}

