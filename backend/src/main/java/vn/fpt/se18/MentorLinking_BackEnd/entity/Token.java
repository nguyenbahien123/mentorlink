package vn.fpt.se18.MentorLinking_BackEnd.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Setter
@Getter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "token")
public class Token extends AbstractEntity<Integer> {

    @Column(name = "username", unique = true)
    private String username;

    // Make sure DB column can hold long JWT strings (use TEXT)
    @Column(name = "access_token", columnDefinition = "TEXT")
    private String accessToken;

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken;

    @Column(name = "reset_token", columnDefinition = "TEXT")
    private String resetToken;
}
