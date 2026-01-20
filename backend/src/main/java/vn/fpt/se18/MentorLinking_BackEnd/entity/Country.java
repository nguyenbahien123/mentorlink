package vn.fpt.se18.MentorLinking_BackEnd.entity;

import jakarta.persistence.*;
import lombok.*;
import vn.fpt.se18.MentorLinking_BackEnd.util.CONTINENTS;

@Entity
@Table(name = "countries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Country extends AbstractEntity<Long> {

    @Column(name = "code", nullable = false, unique = true)
    private String code; // e.g., USA, KOR, AUS

    @Column(name = "name", nullable = false)
    private String name; // United States, Korea...

    @Column(name = "flag_url")
    private String flagUrl; // Link ảnh cờ

    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // Mô tả ngắn về chương trình du học

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private Status status; // ACTIVE / PENDING / INACTIVE

    @Enumerated(EnumType.STRING)
    @Column(name = "continent")
    private CONTINENTS continent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;
}
