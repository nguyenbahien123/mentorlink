package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.FaqRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.FaqResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.FAQ;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.FaqRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.FaqService;
import vn.fpt.se18.MentorLinking_BackEnd.util.Urgency;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class FaqServiceImpl implements FaqService {

    private final FaqRepository faqRepository;

    @Override
    @Transactional
    public FaqResponse createFaq(FaqRequest request) {
        if (request == null) return null;

        FAQ faq = new FAQ();
        faq.setQuestion(request.getQuestion());
        faq.setAnswer(null);
        faq.setIsPublished(Boolean.FALSE);

        // parse urgency safely
        if (request.getUrgency() != null) {
            try {
                faq.setUrgency(Urgency.valueOf(request.getUrgency().toUpperCase(Locale.ROOT)));
            } catch (IllegalArgumentException ex) {
                // default to LOW if parsing fails
                faq.setUrgency(Urgency.LOW);
            }
        } else {
            faq.setUrgency(Urgency.LOW);
        }

        // try to set createdBy from security context if present
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User user) {
                faq.setCreatedBy(user);
            }
        } catch (Exception ex) {
            log.debug("Unable to set createdBy for FAQ: {}", ex.getMessage());
        }

        FAQ saved = faqRepository.save(faq);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FaqResponse> getPublishedFaqs(int page, int size, String sort) {
        // default order: createdAt desc
        Sort.Order order = new Sort.Order(Sort.Direction.DESC, "createdAt");

        if (sort != null && !sort.isBlank()) {
            Pattern pattern = Pattern.compile("^(\\w+):(asc|desc)$", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(sort);
            if (matcher.find()) {
                String columnName = matcher.group(1);
                if (matcher.group(2).equalsIgnoreCase("asc")) {
                    order = new Sort.Order(Sort.Direction.ASC, columnName);
                } else {
                    order = new Sort.Order(Sort.Direction.DESC, columnName);
                }
            }
        }

        int pageNo = 0;
        if (page > 0) pageNo = page - 1;

        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(order));

        Page<FAQ> entityPage = faqRepository.findByIsPublishedTrue(pageable);
        List<FaqResponse> list = entityPage.stream().map(this::toResponse).toList();

        return new PageImpl<>(list, pageable, entityPage.getTotalElements());
    }

    @Override
    @Transactional
    public FaqResponse publishFaq(Long id, boolean published) {
        Optional<FAQ> opt = faqRepository.findById(id);
        FAQ faq = opt.orElseThrow(() -> new AppException(ErrorCode.INVALID_ENDPOINT, "FAQ not found"));
        faq.setIsPublished(published);
        FAQ saved = faqRepository.save(faq);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public FaqResponse getFaqDetail(Long id) {
        Optional<FAQ> opt = faqRepository.findById(id);
        FAQ faq = opt.orElseThrow(() -> new AppException(ErrorCode.INVALID_ENDPOINT, "FAQ not found"));
        return toResponse(faq);
    }

    private FaqResponse toResponse(FAQ f) {
        if (f == null) return null;
        String author = null;
        if (f.getCreatedBy() != null) {
            if (f.getCreatedBy().getFullname() != null) author = f.getCreatedBy().getFullname();
            else author = f.getCreatedBy().getUsername();
        }
        return FaqResponse.builder()
                .id(f.getId())
                .question(f.getQuestion())
                .answer(f.getAnswer())
                .urgency(f.getUrgency() != null ? f.getUrgency().name() : null)
                .isPublished(Boolean.TRUE.equals(f.getIsPublished()))
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .createdBy(author)
                .build();
    }
}
