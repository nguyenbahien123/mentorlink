package vn.fpt.se18.MentorLinking_BackEnd.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "schedule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule extends AbstractEntity<Long> {

    @Column(name = "date", nullable = false)
    private java.time.LocalDate date;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "schedule_time_slot",
            joinColumns = @JoinColumn(name = "schedule_id"),
            inverseJoinColumns = @JoinColumn(name = "time_slot_id")
    )
    private Set<TimeSlot> timeSlots;

    @Column(name = "price", nullable = false)
    private Double price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    // New: flag persisted in DB to indicate schedule is booked
    @Column(name = "is_booked", columnDefinition = "boolean default false")
    private Boolean isBooked = false;

    // Explicit getter to avoid naming ambiguity (Lombok may generate isBooked()/getIsBooked())
    public Boolean getIsBooked() {
        return this.isBooked;
    }
}