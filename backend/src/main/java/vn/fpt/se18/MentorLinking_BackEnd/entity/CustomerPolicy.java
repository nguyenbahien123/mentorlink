package vn.fpt.se18.MentorLinking_BackEnd.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customer_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerPolicy extends AbstractEntity<Long> {

    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // Compatibility helper used by DataSyncService
    public String getDescription() {
        return this.content;
    }
}
