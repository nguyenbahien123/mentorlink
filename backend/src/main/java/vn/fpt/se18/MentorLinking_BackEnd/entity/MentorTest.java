package vn.fpt.se18.MentorLinking_BackEnd.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mentor_tests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorTest extends AbstractEntity<Long> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "test_name", nullable = false)
    private String testName;

    @Column(name = "score", nullable = false)
    private String score;

    @Column(name = "score_image")
    private String scoreImage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", nullable = false)
    private Status status; // PENDING / APPROVED / REJECTED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;
}
