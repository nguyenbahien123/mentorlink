package vn.fpt.se18.MentorLinking_BackEnd.service.admin;

import org.springframework.data.domain.Page;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.FaqRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.FaqResponse;


public interface AdminFaqService {

    Page<FaqResponse> getAllFaqs(String keyword, Boolean published, String urgency, String sort, int page, int size);

    FaqResponse getFaqById(Long id);

    FaqResponse createFaq(FaqRequest request, String adminEmail);

    FaqResponse updateFaq(Long id, FaqRequest request, String adminEmail);

    void deleteFaq(Long id);

    FaqResponse togglePublishStatus(Long id, boolean published);

    FaqResponse answerFaq(Long id, String answer, String adminEmail);
}
