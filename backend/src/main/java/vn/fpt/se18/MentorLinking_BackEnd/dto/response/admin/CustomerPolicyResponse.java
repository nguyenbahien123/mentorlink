package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerPolicyResponse {

    private Long id;

    private String title;

    private String content;

    private Boolean isActive;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
