package vn.fpt.se18.MentorLinking_BackEnd.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PageResponse<BODY> {
    private List<BODY> content;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<StatusCountResponse> statusCounts;

}
