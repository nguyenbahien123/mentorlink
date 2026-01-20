package vn.fpt.se18.MentorLinking_BackEnd.dto.request.user;

import lombok.Getter;
import lombok.Setter;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;

import java.time.LocalDateTime;

@Getter
@Setter
public class MentorManagementResponse {
    private Long id;
    private String fullname;
    private String email;
    private String phone;
    private String title;
    private String highestDegreeName;
    private Integer serviceCount;
    private Integer completionPercent;
    private Long statusId;
    private String statusName;
    private LocalDateTime createdAt;

    // convenience constructor from User
    public MentorManagementResponse() {
    }

    public MentorManagementResponse(User u) {
        if (u != null) {
            this.id = u.getId();
            this.fullname = u.getFullname();
            this.email = u.getEmail();
            this.phone = u.getPhone();
            this.title = u.getTitle();
            this.highestDegreeName = u.getHighestDegree() != null ? u.getHighestDegree().getName() : null;
            this.serviceCount = u.getMentorServices() != null ? u.getMentorServices().size() : 0;
            // naive completion percent: if has intro, avatar, at least 1 service -> 100, else estimate
            int percent = 0;
            if (u.getAvatarUrl() != null && !u.getAvatarUrl().isBlank()) percent += 30;
            if (u.getIntro() != null && !u.getIntro().isBlank()) percent += 30;
            if (this.serviceCount != null && this.serviceCount > 0) percent += 40;
            this.completionPercent = Math.min(100, percent);
            this.statusId = u.getStatus() != null ? u.getStatus().getId() : null;
            this.statusName = u.getStatus() != null ? u.getStatus().getName() : null;
            this.createdAt = u.getCreatedAt();
        }
    }
}
