package vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorServiceResponse {
    private Long id;

    private String serviceName;

    private String description;

    private String status;

    private String statusCode;

    private String mentorName;

    private Long mentorId;

    private String createdAt;

    private String updatedAt;

    // Constructor cho repository query DTO
    public MentorServiceResponse(Long id, String serviceName, String description,
                                  String status, String statusCode, Long mentorId,
                                  String mentorName, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.serviceName = serviceName;
        this.description = description;
        this.status = status;
        this.statusCode = statusCode;
        this.mentorId = mentorId;
        this.mentorName = mentorName;
        this.createdAt = createdAt != null ? createdAt.toString() : null;
        this.updatedAt = updatedAt != null ? updatedAt.toString() : null;
    }
}
