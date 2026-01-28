package vn.fpt.se18.MentorLinking_BackEnd.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "review_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token", nullable = false, unique = true, length = 255)
    private String token;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Kiểm tra token còn hợp lệ (chưa hết hạn và chưa dùng)
     */
    public boolean isValid() {
        return !isUsed && LocalDateTime.now().isBefore(expiresAt);
    }

    /**
     * Kiểm tra token đã hết hạn
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
