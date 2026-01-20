package vn.fpt.se18.MentorLinking_BackEnd.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "time_slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeSlot extends AbstractEntity<Long> {

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "timestart", nullable = false)
    private Integer timeStart;

    @Column(name = "timeend", nullable = false)
    private Integer timeEnd;
}
