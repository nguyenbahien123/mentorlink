package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl.adminImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.FaqRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.FaqResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.FAQ;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.FaqRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.AdminFaqService;
import vn.fpt.se18.MentorLinking_BackEnd.util.Urgency;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminFaqServiceImpl implements AdminFaqService {

    private final FaqRepository faqRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<FaqResponse> getAllFaqs(String keyword, Boolean published, String urgency, String sort, int page, int size) {
        log.info("Admin fetching FAQs - keyword: {}, published: {}, urgency: {}, page: {}", keyword, published, urgency, page);
        
        // Parse sort parameter (format: "fieldName,direction")
        Sort.Order order = new Sort.Order(Sort.Direction.DESC, "createdAt");
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            if (parts.length == 2) {
                String field = parts[0].trim();
                String direction = parts[1].trim().toLowerCase();
                order = direction.equals("asc") 
                    ? new Sort.Order(Sort.Direction.ASC, field)
                    : new Sort.Order(Sort.Direction.DESC, field);
            }
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(order));
        Page<FAQ> entityPage;

        // Build query based on filters
        if (keyword != null && !keyword.isBlank()) {
            if (published != null && urgency != null && !urgency.isBlank()) {
                Urgency urgencyEnum = parseUrgency(urgency);
                entityPage = faqRepository.findByQuestionContainingIgnoreCaseAndIsPublishedAndUrgency(
                    keyword, published, urgencyEnum, pageable);
            } else if (published != null) {
                entityPage = faqRepository.findByQuestionContainingIgnoreCaseAndIsPublished(
                    keyword, published, pageable);
            } else if (urgency != null && !urgency.isBlank()) {
                Urgency urgencyEnum = parseUrgency(urgency);
                entityPage = faqRepository.findByQuestionContainingIgnoreCaseAndUrgency(
                    keyword, urgencyEnum, pageable);
            } else {
                entityPage = faqRepository.findByQuestionContainingIgnoreCase(keyword, pageable);
            }
        } else if (published != null) {
            if (urgency != null && !urgency.isBlank()) {
                Urgency urgencyEnum = parseUrgency(urgency);
                entityPage = faqRepository.findByIsPublishedAndUrgency(published, urgencyEnum, pageable);
            } else {
                entityPage = published 
                    ? faqRepository.findByIsPublishedTrue(pageable)
                    : faqRepository.findByIsPublishedFalse(pageable);
            }
        } else if (urgency != null && !urgency.isBlank()) {
            Urgency urgencyEnum = parseUrgency(urgency);
            entityPage = faqRepository.findByUrgency(urgencyEnum, pageable);
        } else {
            entityPage = faqRepository.findAll(pageable);
        }

        List<FaqResponse> list = entityPage.stream().map(this::toResponse).toList();
        log.info("Found {} FAQs (page {} of {})", entityPage.getTotalElements(), page + 1, entityPage.getTotalPages());
        
        return new PageImpl<>(list, pageable, entityPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public FaqResponse getFaqById(Long id) {
        log.info("Admin getting FAQ by ID: {}", id);
        Optional<FAQ> opt = faqRepository.findById(id);
        FAQ faq = opt.orElseThrow(() -> new AppException(ErrorCode.INVALID_ENDPOINT, "FAQ not found with ID: " + id));
        return toResponse(faq);
    }

    @Override
    @Transactional
    public FaqResponse createFaq(FaqRequest request, String adminEmail) {
        log.info("Admin {} creating new FAQ", adminEmail);
        
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_ENDPOINT, "FAQ request cannot be null");
        }

        FAQ faq = new FAQ();
        faq.setQuestion(request.getQuestion());
        faq.setAnswer(request.getAnswer());
        faq.setIsPublished(request.getIsPublished() != null ? request.getIsPublished() : Boolean.FALSE);
        faq.setUrgency(parseUrgencyFromRequest(request.getUrgency()));

        FAQ saved = faqRepository.save(faq);
        log.info("Admin {} created FAQ with ID: {}", adminEmail, saved.getId());
        
        return toResponse(saved);
    }

    @Override
    @Transactional
    public FaqResponse updateFaq(Long id, FaqRequest request, String adminEmail) {
        log.info("Admin {} updating FAQ with ID: {}", adminEmail, id);
        
        Optional<FAQ> opt = faqRepository.findById(id);
        FAQ faq = opt.orElseThrow(() -> new AppException(ErrorCode.INVALID_ENDPOINT, "FAQ not found with ID: " + id));

        // Update fields if provided
        if (request.getQuestion() != null && !request.getQuestion().isBlank()) {
            faq.setQuestion(request.getQuestion());
        }
        if (request.getAnswer() != null) {
            faq.setAnswer(request.getAnswer());
        }
        if (request.getIsPublished() != null) {
            faq.setIsPublished(request.getIsPublished());
        }
        if (request.getUrgency() != null && !request.getUrgency().isBlank()) {
            faq.setUrgency(parseUrgencyFromRequest(request.getUrgency()));
        }

        FAQ saved = faqRepository.save(faq);
        log.info("Admin {} successfully updated FAQ with ID: {}", adminEmail, id);
        
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteFaq(Long id) {
        log.info("Admin deleting FAQ with ID: {}", id);
        
        Optional<FAQ> opt = faqRepository.findById(id);
        FAQ faq = opt.orElseThrow(() -> new AppException(ErrorCode.INVALID_ENDPOINT, "FAQ not found with ID: " + id));
        
        faqRepository.delete(faq);
        log.info("FAQ with ID {} successfully deleted", id);
    }

    @Override
    @Transactional
    public FaqResponse togglePublishStatus(Long id, boolean published) {
        log.info("Admin toggling publish status for FAQ {} to {}", id, published);
        
        Optional<FAQ> opt = faqRepository.findById(id);
        FAQ faq = opt.orElseThrow(() -> new AppException(ErrorCode.INVALID_ENDPOINT, "FAQ not found with ID: " + id));
        
        faq.setIsPublished(published);
        FAQ saved = faqRepository.save(faq);
        
        log.info("FAQ {} publish status changed to {}", id, published);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public FaqResponse answerFaq(Long id, String answer, String adminEmail) {
        log.info("Admin {} answering FAQ with ID: {}", adminEmail, id);
        
        if (answer == null || answer.isBlank()) {
            throw new AppException(ErrorCode.INVALID_ENDPOINT, "Answer cannot be empty");
        }
        
        Optional<FAQ> opt = faqRepository.findById(id);
        FAQ faq = opt.orElseThrow(() -> new AppException(ErrorCode.INVALID_ENDPOINT, "FAQ not found with ID: " + id));
        
        faq.setAnswer(answer);
        FAQ saved = faqRepository.save(faq);
        
        log.info("Admin {} successfully answered FAQ with ID: {}", adminEmail, id);
        return toResponse(saved);
    }

    /**
     * Convert FAQ entity to FaqResponse DTO
     */
    private FaqResponse toResponse(FAQ faq) {
        if (faq == null) return null;
        
        String author = null;
        if (faq.getCreatedBy() != null) {
            author = faq.getCreatedBy().getFullname() != null 
                ? faq.getCreatedBy().getFullname() 
                : faq.getCreatedBy().getUsername();
        }
        
        return FaqResponse.builder()
                .id(faq.getId())
                .question(faq.getQuestion())
                .answer(faq.getAnswer())
                .urgency(faq.getUrgency() != null ? faq.getUrgency().name() : null)
                .isPublished(Boolean.TRUE.equals(faq.getIsPublished()))
                .createdAt(faq.getCreatedAt())
                .updatedAt(faq.getUpdatedAt())
                .createdBy(author)
                .build();
    }

    /**
     * Parse urgency from string with validation
     */
    private Urgency parseUrgency(String urgency) {
        if (urgency == null || urgency.isBlank()) {
            return Urgency.LOW;
        }
        try {
            return Urgency.valueOf(urgency.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            log.warn("Invalid urgency value: {}, defaulting to LOW", urgency);
            return Urgency.LOW;
        }
    }

    private Urgency parseUrgencyFromRequest(String urgency) {
        if (urgency == null || urgency.isBlank()) {
            return Urgency.LOW;
        }
        try {
            return Urgency.valueOf(urgency.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            log.warn("Invalid urgency value in request: {}, defaulting to LOW", urgency);
            return Urgency.LOW;
        }
    }
}
