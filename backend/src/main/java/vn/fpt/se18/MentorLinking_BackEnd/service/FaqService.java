package vn.fpt.se18.MentorLinking_BackEnd.service;

import org.springframework.data.domain.Page;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.FaqRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.FaqResponse;

public interface FaqService {

    FaqResponse createFaq(FaqRequest request);

    Page<FaqResponse> getPublishedFaqs(int page, int size, String sort);

    @Deprecated
    FaqResponse publishFaq(Long id, boolean published);

    FaqResponse getFaqDetail(Long id);
}
