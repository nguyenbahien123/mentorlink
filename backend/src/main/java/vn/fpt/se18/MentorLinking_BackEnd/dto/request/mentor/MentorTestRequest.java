package vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor;

import jakarta.persistence.Column;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorTestRequest {

    private String testName;

    private String score;

    private String scoreImage;
    
    private MultipartFile scoreImageFile;
}
