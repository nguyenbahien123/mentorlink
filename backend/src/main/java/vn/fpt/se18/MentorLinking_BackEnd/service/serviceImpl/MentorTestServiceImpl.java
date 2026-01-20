package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor.MentorTestRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorTestResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorTest;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorTestRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorTestService;
import vn.fpt.se18.MentorLinking_BackEnd.service.UploadImageFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MentorTestServiceImpl implements MentorTestService {

    private final MentorTestRepository mentorTestRepository;
    private final UserRepository userRepository;
    private final StatusRepository statusRepository;
    private final UploadImageFile uploadImageFile;

    @Override
    @Transactional
    public MentorTestResponse createMentorTest(Long mentorId, MentorTestRequest request) {
        log.info("Creating mentor test for mentor id: {}", mentorId);

        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Status pending = statusRepository.findByCode("PENDING")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

        // Upload score image if provided
        String scoreImageUrl = null;
        if (request.getScoreImageFile() != null && !request.getScoreImageFile().isEmpty()) {
            try {
                scoreImageUrl = uploadImageFile.uploadImage(request.getScoreImageFile());
                log.info("Score image uploaded successfully: {}", scoreImageUrl);
            } catch (IOException e) {
                log.error("Failed to upload score image for test {}: {}", request.getTestName(), e.getMessage());
                throw new AppException(ErrorCode.UNCATEGORIZED, "Failed to upload score image: " + e.getMessage());
            }
        }

        MentorTest mt = MentorTest.builder()
                .user(mentor)
                .testName(request.getTestName())
                .score(request.getScore())
                .scoreImage(scoreImageUrl)
                .status(pending)
                .createdBy(mentor)
                .build();

        MentorTest saved = mentorTestRepository.save(mt);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MentorTestResponse getMentorTestById(Long testId) {
        log.info("Getting mentor test by id: {}", testId);

        MentorTest test = mentorTestRepository.findByIdWithRelationships(testId)
                .orElseThrow(() -> new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND));

        return toResponse(test);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorTestResponse> getMentorTestsByMentorId(Long mentorId) {
        log.info("Getting tests for mentor id: {}", mentorId);

        userRepository.findById(mentorId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<MentorTest> list = mentorTestRepository.findByUserId(mentorId);
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MentorTestResponse> getMentorTestsPaginated(Long mentorId, int page, int size) {
        log.info("Getting paginated tests for mentor id: {}, page: {}, size: {}", mentorId, page, size);

        userRepository.findById(mentorId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        int pageNo = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<MentorTest> pageEntity = mentorTestRepository.findByUserIdPaginated(mentorId, pageable);

        return pageEntity.map(this::toResponse);
    }

    @Override
    @Transactional
    public MentorTestResponse updateMentorTest(Long testId, Long mentorId, MentorTestRequest request) {
        log.info("Updating mentor test id: {} for mentor id: {}", testId, mentorId);

        User mentor = userRepository.findById(mentorId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        MentorTest test = mentorTestRepository.findById(testId)
                .orElseThrow(() -> new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND));

        if (!test.getUser().getId().equals(mentorId)) {
            throw new AppException(ErrorCode.INVALID_INPUT);
        }

        test.setTestName(request.getTestName());
        test.setScore(request.getScore());
        
        // Upload new image if provided
        if (request.getScoreImageFile() != null && !request.getScoreImageFile().isEmpty()) {
            try {
                String scoreImageUrl = uploadImageFile.uploadImage(request.getScoreImageFile());
                test.setScoreImage(scoreImageUrl);
                log.info("Score image updated successfully: {}", scoreImageUrl);
            } catch (IOException e) {
                log.error("Failed to upload score image for test update {}: {}", request.getTestName(), e.getMessage());
                throw new AppException(ErrorCode.UNCATEGORIZED, "Failed to upload score image: " + e.getMessage());
            }
        }

        Status pending = statusRepository.findByCode("PENDING")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

        test.setStatus(pending);
        test.setUpdatedBy(mentor);

        MentorTest saved = mentorTestRepository.save(test);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteMentorTest(Long testId, Long mentorId) {
        log.info("Deleting mentor test id: {} by mentor id: {}", testId, mentorId);

        userRepository.findById(mentorId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        MentorTest test = mentorTestRepository.findById(testId)
                .orElseThrow(() -> new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND));

        if (!test.getUser().getId().equals(mentorId)) {
            throw new AppException(ErrorCode.INVALID_INPUT);
        }

        mentorTestRepository.delete(test);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorTestResponse> getTestsByMentorAndStatus(Long mentorId, String statusCode) {
        log.info("Getting tests for mentor id: {} with status: {}", mentorId, statusCode);

        userRepository.findById(mentorId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<MentorTest> list = mentorTestRepository.findByUserIdAndStatusCode(mentorId, statusCode);
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorTestResponse> getAllApprovedTests() {
        log.info("Getting all approved tests (public)");

        List<MentorTest> list = mentorTestRepository.findByStatusCode("APPROVED");
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MentorTestResponse approveTest(Long testId) {
        log.info("Approving mentor test id: {}", testId);

        MentorTest test = mentorTestRepository.findById(testId)
                .orElseThrow(() -> new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND));

        Status approved = statusRepository.findByCode("APPROVED")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

        test.setStatus(approved);
        MentorTest saved = mentorTestRepository.save(test);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public MentorTestResponse rejectTest(Long testId) {
        log.info("Rejecting mentor test id: {}", testId);

        MentorTest test = mentorTestRepository.findById(testId)
                .orElseThrow(() -> new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND));

        Status rejected = statusRepository.findByCode("REJECTED")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

        test.setStatus(rejected);
        MentorTest saved = mentorTestRepository.save(test);
        return toResponse(saved);
    }

    private MentorTestResponse toResponse(MentorTest mt) {
        if (mt == null) return null;
        return MentorTestResponse.builder()
                .id(mt.getId())
                .mentorId(mt.getUser() != null ? mt.getUser().getId() : null)
                .testName(mt.getTestName())
                .score(mt.getScore())
                .scoreImage(mt.getScoreImage())
                .status(mt.getStatus() != null ? mt.getStatus().getName() : null)
                .statusCode(mt.getStatus() != null ? mt.getStatus().getCode() : null)
                .createdAt(mt.getCreatedAt() != null ? mt.getCreatedAt().toString() : null)
                .updatedAt(mt.getUpdatedAt() != null ? mt.getUpdatedAt().toString() : null)
                .build();
    }
}
