package kr.co.th.vo;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "water_reservation")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaterReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate reservationDate;
    private int peopleCount;
    private String ticketType;
    private int amount;
    private String status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "imp_uid")
    private String impUid;
}

