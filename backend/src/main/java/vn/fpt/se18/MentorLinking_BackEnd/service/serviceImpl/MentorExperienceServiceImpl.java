package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor.MentorExperienceRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorExperienceResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorExperience;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorExperienceRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorExperienceService;
import vn.fpt.se18.MentorLinking_BackEnd.service.UploadImageFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MentorExperienceServiceImpl implements MentorExperienceService {

    private final MentorExperienceRepository mentorExperienceRepository;
    private final UserRepository userRepository;
    private final StatusRepository statusRepository;
    private final UploadImageFile uploadImageFile;

    @Override
    @Transactional
    public MentorExperienceResponse createMentorExperience(Long mentorId, MentorExperienceRequest request) {
        log.info("Creating mentor experience for mentor id: {}", mentorId);

        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Status pending = statusRepository.findByCode("PENDING")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

        // Upload experience image if provided
        String experienceImageUrl = null;
        if (request.getScoreImageFile() != null && !request.getScoreImageFile().isEmpty()) {
            try {
                experienceImageUrl = uploadImageFile.uploadImage(request.getScoreImageFile());
                log.info("Experience image uploaded successfully: {}", experienceImageUrl);
            } catch (IOException e) {
                log.error("Failed to upload experience image for {}: {}", request.getCompanyName(), e.getMessage());
                throw new AppException(ErrorCode.UNCATEGORIZED, "Failed to upload experience image: " + e.getMessage());
            }
        } else if (request.getExperienceImage() != null) {
            experienceImageUrl = request.getExperienceImage();
        }

        MentorExperience me = MentorExperience.builder()
                .user(mentor)
                .companyName(request.getCompanyName())
                .position(request.getPosition())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .experienceImage(experienceImageUrl)
                .status(pending)
                .createdBy(mentor)
                .build();

        MentorExperience saved = mentorExperienceRepository.save(me);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MentorExperienceResponse getMentorExperienceById(Long experienceId) {
        log.info("Getting mentor experience by id: {}", experienceId);

        MentorExperience experience = mentorExperienceRepository.findByIdWithRelationships(experienceId)
                .orElseThrow(() -> new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND));

        return toResponse(experience);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorExperienceResponse> getMentorExperiencesByMentorId(Long mentorId) {
        log.info("Getting experiences for mentor id: {}", mentorId);

        userRepository.findById(mentorId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<MentorExperience> list = mentorExperienceRepository.findByUserId(mentorId);
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MentorExperienceResponse> getMentorExperiencesPaginated(Long mentorId, int page, int size) {
        log.info("Getting paginated experiences for mentor id: {}, page: {}, size: {}", mentorId, page, size);

        userRepository.findById(mentorId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        int pageNo = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<MentorExperience> pageEntity = mentorExperienceRepository.findByUserIdPaginated(mentorId, pageable);

        return pageEntity.map(this::toResponse);
    }

    @Override
    @Transactional
    public MentorExperienceResponse updateMentorExperience(Long experienceId, Long mentorId, MentorExperienceRequest request) {
        log.info("Updating mentor experience id: {} for mentor id: {}", experienceId, mentorId);

        User mentor = userRepository.findById(mentorId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        MentorExperience experience = mentorExperienceRepository.findById(experienceId)
                .orElseThrow(() -> new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND));

        if (!experience.getUser().getId().equals(mentorId)) {
            throw new AppException(ErrorCode.INVALID_INPUT);
        }

        experience.setCompanyName(request.getCompanyName());
        experience.setPosition(request.getPosition());
        experience.setStartDate(request.getStartDate());
        experience.setEndDate(request.getEndDate());

        // Upload new image if provided
        if (request.getScoreImageFile() != null && !request.getScoreImageFile().isEmpty()) {
            try {
                String experienceImageUrl = uploadImageFile.uploadImage(request.getScoreImageFile());
                experience.setExperienceImage(experienceImageUrl);
                log.info("Experience image updated successfully: {}", experienceImageUrl);
            } catch (IOException e) {
                log.error("Failed to upload experience image for update {}: {}", request.getCompanyName(), e.getMessage());
                throw new AppException(ErrorCode.UNCATEGORIZED, "Failed to upload experience image: " + e.getMessage());
            }
        } else if (request.getExperienceImage() != null) {
            experience.setExperienceImage(request.getExperienceImage());
        }

        Status pending = statusRepository.findByCode("PENDING")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

        experience.setStatus(pending);
        experience.setUpdatedBy(mentor);

        MentorExperience saved = mentorExperienceRepository.save(experience);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteMentorExperience(Long experienceId, Long mentorId) {
        log.info("Deleting mentor experience id: {} by mentor id: {}", experienceId, mentorId);

        userRepository.findById(mentorId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        MentorExperience experience = mentorExperienceRepository.findById(experienceId)
                .orElseThrow(() -> new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND));

        if (!experience.getUser().getId().equals(mentorId)) {
            throw new AppException(ErrorCode.INVALID_INPUT);
        }

        mentorExperienceRepository.delete(experience);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorExperienceResponse> getExperiencesByMentorAndStatus(Long mentorId, String statusCode) {
        log.info("Getting experiences for mentor id: {} with status: {}", mentorId, statusCode);

        userRepository.findById(mentorId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<MentorExperience> list = mentorExperienceRepository.findByUserIdAndStatusCode(mentorId, statusCode);
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorExperienceResponse> getAllApprovedExperiences() {
        log.info("Getting all approved experiences (public)");

        List<MentorExperience> list = mentorExperienceRepository.findByStatusCode("APPROVED");
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorExperienceResponse> getApprovedByMentorId(Long mentorId) {
        log.info("Getting approved experiences for mentor id: {}", mentorId);

        return mentorExperienceRepository.findByUserIdAndStatusCode(mentorId, "APPROVED").stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MentorExperienceResponse approveExperience(Long experienceId) {
        log.info("Approving mentor experience id: {}", experienceId);

        MentorExperience experience = mentorExperienceRepository.findById(experienceId)
                .orElseThrow(() -> new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND));

        Status approved = statusRepository.findByCode("APPROVED")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

        experience.setStatus(approved);
        MentorExperience saved = mentorExperienceRepository.save(experience);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public MentorExperienceResponse rejectExperience(Long experienceId) {
        log.info("Rejecting mentor experience id: {}", experienceId);

        MentorExperience experience = mentorExperienceRepository.findById(experienceId)
                .orElseThrow(() -> new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND));

        Status rejected = statusRepository.findByCode("REJECTED")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

        experience.setStatus(rejected);
        MentorExperience saved = mentorExperienceRepository.save(experience);
        return toResponse(saved);
    }

    private MentorExperienceResponse toResponse(MentorExperience me) {
        if (me == null) return null;
        return MentorExperienceResponse.builder()
                .id(me.getId())
                .companyName(me.getCompanyName())
                .position(me.getPosition())
                .startDate(me.getStartDate())
                .endDate(me.getEndDate())
                .experienceImage(me.getExperienceImage())
                .status(me.getStatus() != null ? me.getStatus().getName() : null)
                .statusCode(me.getStatus() != null ? me.getStatus().getCode() : null)
                .build();
    }
}

