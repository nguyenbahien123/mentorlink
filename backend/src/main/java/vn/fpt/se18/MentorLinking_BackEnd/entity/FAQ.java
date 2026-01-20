package vn.fpt.se18.MentorLinking_BackEnd.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;
import vn.fpt.se18.MentorLinking_BackEnd.util.Urgency;

@Entity
@Table(name = "FAQ")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FAQ  extends  AbstractEntity<Long> {
    @Column(name = "question", nullable = false, length = 500)
    private String question;

    @Column(name = "answer", columnDefinition = "TEXT")
    private String answer;

    private Urgency urgency;

    @Column(name = "is_published", columnDefinition = "boolean default false")
    private Boolean isPublished;

    @ManyToOne
    private User createdBy;
}
