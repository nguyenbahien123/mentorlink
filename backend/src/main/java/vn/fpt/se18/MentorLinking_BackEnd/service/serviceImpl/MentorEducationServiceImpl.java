package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor.MentorEducationRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorEducationResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorEducation;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorEducationRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorEducationService;
import vn.fpt.se18.MentorLinking_BackEnd.service.UploadImageFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MentorEducationServiceImpl implements MentorEducationService {

    private final MentorEducationRepository mentorEducationRepository;
    private final UserRepository userRepository;
    private final StatusRepository statusRepository;
    private final UploadImageFile uploadImageFile;

    @Override
    @Transactional
    public MentorEducationResponse createMentorEducation(Long mentorId, MentorEducationRequest request) {
        log.info("Creating mentor education for mentor id: {}", mentorId);

        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Status pending = statusRepository.findByCode("PENDING")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

        // Upload certificate image if provided
        String certificateImageUrl = null;
        if (request.getScoreImageFile() != null && !request.getScoreImageFile().isEmpty()) {
            try {
                certificateImageUrl = uploadImageFile.uploadImage(request.getScoreImageFile());
                log.info("Certificate image uploaded successfully: {}", certificateImageUrl);
            } catch (IOException e) {
                log.error("Failed to upload certificate image for education {}: {}", request.getSchoolName(), e.getMessage());
                throw new AppException(ErrorCode.UNCATEGORIZED, "Failed to upload certificate image: " + e.getMessage());
            }
        } else if (request.getCertificateImage() != null) {
            certificateImageUrl = request.getCertificateImage();
        }

        MentorEducation me = MentorEducation.builder()
                .user(mentor)
                .schoolName(request.getSchoolName())
                .major(request.getMajor())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .certificateImage(certificateImageUrl)
                .status(pending)
                .createdBy(mentor)
                .build();

        MentorEducation saved = mentorEducationRepository.save(me);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MentorEducationResponse getMentorEducationById(Long educationId) {
        log.info("Getting mentor education by id: {}", educationId);

        MentorEducation education = mentorEducationRepository.findById(educationId)
                .orElseThrow(() -> new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND));

        return toResponse(education);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorEducationResponse> getMentorEducationsByMentorId(Long mentorId) {
        log.info("Getting educations for mentor id: {}", mentorId);

        userRepository.findById(mentorId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<MentorEducation> list = mentorEducationRepository.findByUserId(mentorId);
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MentorEducationResponse> getMentorEducationsPaginated(Long mentorId, int page, int size) {
        log.info("Getting paginated educations for mentor id: {}, page: {}, size: {}", mentorId, page, size);

        userRepository.findById(mentorId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        int pageNo = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<MentorEducation> pageEntity = mentorEducationRepository.findByUserIdPaginated(mentorId, pageable);

        return pageEntity.map(this::toResponse);
    }

    @Override
    @Transactional
    public MentorEducationResponse updateMentorEducation(Long educationId, Long mentorId, MentorEducationRequest request) {
        log.info("Updating mentor education id: {} for mentor id: {}", educationId, mentorId);

        User mentor = userRepository.findById(mentorId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        MentorEducation education = mentorEducationRepository.findById(educationId)
                .orElseThrow(() -> new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND));

        if (!education.getUser().getId().equals(mentorId)) {
            throw new AppException(ErrorCode.INVALID_INPUT);
        }

        education.setSchoolName(request.getSchoolName());
        education.setMajor(request.getMajor());
        education.setStartDate(request.getStartDate());
        education.setEndDate(request.getEndDate());

        // Upload new certificate image if provided
        if (request.getScoreImageFile() != null && !request.getScoreImageFile().isEmpty()) {
            try {
                String certificateImageUrl = uploadImageFile.uploadImage(request.getScoreImageFile());
                education.setCertificateImage(certificateImageUrl);
                log.info("Certificate image updated successfully: {}", certificateImageUrl);
            } catch (IOException e) {
                log.error("Failed to upload certificate image for education update {}: {}", request.getSchoolName(), e.getMessage());
                throw new AppException(ErrorCode.UNCATEGORIZED, "Failed to upload certificate image: " + e.getMessage());
            }
        } else if (request.getCertificateImage() != null) {
            education.setCertificateImage(request.getCertificateImage());
        }

        Status pending = statusRepository.findByCode("PENDING")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

        education.setStatus(pending);
        education.setUpdatedBy(mentor);

        MentorEducation saved = mentorEducationRepository.save(education);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteMentorEducation(Long educationId, Long mentorId) {
        log.info("Deleting mentor education id: {} by mentor id: {}", educationId, mentorId);

        userRepository.findById(mentorId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        MentorEducation education = mentorEducationRepository.findById(educationId)
                .orElseThrow(() -> new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND));

        if (!education.getUser().getId().equals(mentorId)) {
            throw new AppException(ErrorCode.INVALID_INPUT);
        }

        mentorEducationRepository.delete(education);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorEducationResponse> getEducationsByMentorAndStatus(Long mentorId, String statusCode) {
        log.info("Getting educations for mentor id: {} with status: {}", mentorId, statusCode);

        userRepository.findById(mentorId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<MentorEducation> list = mentorEducationRepository.findByUserIdAndStatusCode(mentorId, statusCode);
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorEducationResponse> getAllApprovedEducations() {
        log.info("Getting all approved educations (public)");

        List<MentorEducation> list = mentorEducationRepository.findByStatusCode("APPROVED");
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MentorEducationResponse approveEducation(Long educationId) {
        log.info("Approving mentor education id: {}", educationId);

        MentorEducation education = mentorEducationRepository.findById(educationId)
                .orElseThrow(() -> new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND));

        Status approved = statusRepository.findByCode("APPROVED")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

        education.setStatus(approved);
        MentorEducation saved = mentorEducationRepository.save(education);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public MentorEducationResponse rejectEducation(Long educationId) {
        log.info("Rejecting mentor education id: {}", educationId);

        MentorEducation education = mentorEducationRepository.findById(educationId)
                .orElseThrow(() -> new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND));

        Status rejected = statusRepository.findByCode("REJECTED")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

        education.setStatus(rejected);
        MentorEducation saved = mentorEducationRepository.save(education);
        return toResponse(saved);
    }

    private MentorEducationResponse toResponse(MentorEducation me) {
        if (me == null) return null;
        return MentorEducationResponse.builder()
                .id(me.getId())
                .mentorId(me.getUser() != null ? me.getUser().getId() : null)
                .schoolName(me.getSchoolName())
                .major(me.getMajor())
                .startDate(me.getStartDate())
                .endDate(me.getEndDate())
                .certificateImage(me.getCertificateImage())
                .status(me.getStatus() != null ? me.getStatus().getName() : null)
                .statusCode(me.getStatus() != null ? me.getStatus().getCode() : null)
                .createdAt(me.getCreatedAt() != null ? me.getCreatedAt().toString() : null)
                .updatedAt(me.getUpdatedAt() != null ? me.getUpdatedAt().toString() : null)
                .build();
    }
}

