package vn.fpt.se18.MentorLinking_BackEnd.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogResponse {
    private Long id;
    private String author;
    private String title;
    private String content;
    private String statusName;
    private Integer viewCount;
    private Boolean isPublished;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
