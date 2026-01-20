package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl.adminImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.feedback.FeedbackFilterRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.feedback.FeedbackResponseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.FeedbackDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.FeedbackStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.FeedbackReport;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.repository.FeedbackReportRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.FeedbackService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackReportRepository feedbackReportRepository;
    private final StatusRepository statusRepository;
    private final UserRepository userRepository;

    @Override
    public BaseResponse<PageResponse<FeedbackDetailResponse>> getAllFeedbacks(BaseRequest<FeedbackFilterRequest> request) {
        try {
            FeedbackFilterRequest data = request.getData();
            
            Pageable pageable = PageRequest.of(
                    data.getPage() - 1,
                    data.getSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );

            Page<FeedbackReport> feedbackPage = feedbackReportRepository.findAllWithCondition(
                    data.getKeySearch(),
                    data.getType(),
                    data.getStatus(),
                    pageable
            );

            List<FeedbackDetailResponse> feedbackResponses = feedbackPage.getContent().stream()
                    .map(this::convertToDetailResponse)
                    .collect(Collectors.toList());

            PageResponse<FeedbackDetailResponse> pageResponse = PageResponse.<FeedbackDetailResponse>builder()
                    .content(feedbackResponses)
                    .totalElements(feedbackPage.getTotalElements())
                    .totalPages(feedbackPage.getTotalPages())
                    .currentPage(data.getPage())
                    .pageSize(data.getSize())
                    .build();

            return BaseResponse.<PageResponse<FeedbackDetailResponse>>builder()
                    .respCode("0")
                    .description("Success")
                    .data(pageResponse)
                    .build();
        } catch (Exception e) {
            log.error("Error getting feedbacks: ", e);
            return BaseResponse.<PageResponse<FeedbackDetailResponse>>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public BaseResponse<FeedbackDetailResponse> getFeedbackById(Long id) {
        try {
            Optional<FeedbackReport> feedbackOpt = feedbackReportRepository.findById(id);
            if (feedbackOpt.isEmpty()) {
                return BaseResponse.<FeedbackDetailResponse>builder()
                        .respCode("1")
                        .description("Feedback not found")
                        .build();
            }

            return BaseResponse.<FeedbackDetailResponse>builder()
                    .respCode("0")
                    .description("Success")
                    .data(convertToDetailResponse(feedbackOpt.get()))
                    .build();
        } catch (Exception e) {
            log.error("Error getting feedback by id: ", e);
            return BaseResponse.<FeedbackDetailResponse>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> respondToFeedback(Long id, FeedbackResponseRequest request) {
        try {
            Optional<FeedbackReport> feedbackOpt = feedbackReportRepository.findById(id);
            if (feedbackOpt.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Feedback not found")
                        .build();
            }

            FeedbackReport feedback = feedbackOpt.get();
            
            // Note: FeedbackReport entity doesn't have response field yet
            // You may need to add it or store in a separate table
            // For now, we'll just update the status

            if (request.getMarkAsResolved() != null && request.getMarkAsResolved()) {
                Optional<Status> resolvedStatus = statusRepository.findByCode("RESOLVED");
                if (resolvedStatus.isPresent()) {
                    feedback.setStatus(resolvedStatus.get());
                }
            }

            feedback.setUpdatedAt(LocalDateTime.now());
            feedbackReportRepository.save(feedback);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Feedback responded successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error responding to feedback: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> markInProgress(Long id) {
        return updateFeedbackStatus(id, "IN_PROGRESS", "Feedback marked as in progress");
    }

    @Override
    @Transactional
    public BaseResponse<Void> markResolved(Long id) {
        return updateFeedbackStatus(id, "RESOLVED", "Feedback marked as resolved");
    }

    @Override
    @Transactional
    public BaseResponse<Void> rejectFeedback(Long id) {
        return updateFeedbackStatus(id, "REJECTED", "Feedback rejected successfully");
    }

    @Override
    @Transactional
    public BaseResponse<Void> deleteFeedback(Long id) {
        try {
            Optional<FeedbackReport> feedbackOpt = feedbackReportRepository.findById(id);
            if (feedbackOpt.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Feedback not found")
                        .build();
            }

            feedbackReportRepository.deleteById(id);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Feedback deleted successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error deleting feedback: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> bulkResolveFeedbacks(List<Long> feedbackIds) {
        try {
            Optional<Status> resolvedStatus = statusRepository.findByCode("RESOLVED");
            if (resolvedStatus.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("RESOLVED status not found")
                        .build();
            }

            List<FeedbackReport> feedbacks = feedbackReportRepository.findAllById(feedbackIds);
            feedbacks.forEach(feedback -> {
                feedback.setStatus(resolvedStatus.get());
                feedback.setUpdatedAt(LocalDateTime.now());
            });
            feedbackReportRepository.saveAll(feedbacks);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Feedbacks resolved successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error bulk resolving feedbacks: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public BaseResponse<FeedbackStatisticsResponse> getStatistics() {
        try {
            long pending = feedbackReportRepository.countByStatusCode("PENDING");
            long inProgress = feedbackReportRepository.countByStatusCode("IN_PROGRESS");
            long resolved = feedbackReportRepository.countByStatusCode("RESOLVED");
            long total = feedbackReportRepository.count();
            
            // For highPriority, we need to add a priority field to the entity
            // For now, we'll use a placeholder
            long highPriority = 0; // TODO: Implement when priority field is added

            FeedbackStatisticsResponse statistics = FeedbackStatisticsResponse.builder()
                    .pending(pending)
                    .inProgress(inProgress)
                    .resolved(resolved)
                    .highPriority(highPriority)
                    .total(total)
                    .build();

            return BaseResponse.<FeedbackStatisticsResponse>builder()
                    .respCode("0")
                    .description("Success")
                    .data(statistics)
                    .build();
        } catch (Exception e) {
            log.error("Error getting statistics: ", e);
            return BaseResponse.<FeedbackStatisticsResponse>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    // Helper methods
    
    private BaseResponse<Void> updateFeedbackStatus(Long id, String statusCode, String successMessage) {
        try {
            Optional<FeedbackReport> feedbackOpt = feedbackReportRepository.findById(id);
            if (feedbackOpt.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Feedback not found")
                        .build();
            }

            Optional<Status> status = statusRepository.findByCode(statusCode);
            if (status.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description(statusCode + " status not found")
                        .build();
            }

            FeedbackReport feedback = feedbackOpt.get();
            feedback.setStatus(status.get());
            feedback.setUpdatedAt(LocalDateTime.now());
            feedbackReportRepository.save(feedback);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description(successMessage)
                    .build();
        } catch (Exception e) {
            log.error("Error updating feedback status: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    private FeedbackDetailResponse convertToDetailResponse(FeedbackReport feedback) {
        String targetInfo = null;
        if (feedback.getTargetId() != null && feedback.getTargetTable() != null) {
            targetInfo = String.format("%s ID: %d", feedback.getTargetTable(), feedback.getTargetId());
            
            // If target is a user, try to get their name
            if ("users".equalsIgnoreCase(feedback.getTargetTable())) {
                Optional<User> targetUser = userRepository.findById(feedback.getTargetId());
                if (targetUser.isPresent()) {
                    targetInfo = "User: " + targetUser.get().getFullname();
                }
            }
        }

        return FeedbackDetailResponse.builder()
                .id(feedback.getId())
                .reporterId(feedback.getReporter() != null ? feedback.getReporter().getId() : null)
                .reporterName(feedback.getReporter() != null ? feedback.getReporter().getFullname() : null)
                .reporterEmail(feedback.getReporter() != null ? feedback.getReporter().getEmail() : null)
                .type(feedback.getType())
                .targetId(feedback.getTargetId())
                .targetTable(feedback.getTargetTable())
                .targetInfo(targetInfo)
                .content(feedback.getContent())
                .status(feedback.getStatus() != null ? feedback.getStatus().getCode() : null)
                .priority(null) // TODO: Add priority field to entity
                .response(null) // TODO: Add response field to entity or separate table
                .createdAt(feedback.getCreatedAt())
                .updatedAt(feedback.getUpdatedAt())
                .resolvedAt(null) // TODO: Add resolvedAt field to entity
                .build();
    }
}
