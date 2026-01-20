package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import vn.fpt.se18.MentorLinking_BackEnd.enums.PolicyType;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class PolicyResponse {
    private Long id;
    private String title;
    private String content;
    private Boolean isActive;
    private PolicyType type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}