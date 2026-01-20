package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor.MentorTestRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorTestResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface MentorTestService {
    MentorTestResponse createMentorTest(Long mentorId, MentorTestRequest request);
    MentorTestResponse getMentorTestById(Long testId);
    List<MentorTestResponse> getMentorTestsByMentorId(Long mentorId);
    Page<MentorTestResponse> getMentorTestsPaginated(Long mentorId, int page, int size);
    MentorTestResponse updateMentorTest(Long testId, Long mentorId, MentorTestRequest request);
    void deleteMentorTest(Long testId, Long mentorId);
    List<MentorTestResponse> getTestsByMentorAndStatus(Long mentorId, String statusCode);
    List<MentorTestResponse> getAllApprovedTests();
    MentorTestResponse approveTest(Long testId);
    MentorTestResponse rejectTest(Long testId);
}

