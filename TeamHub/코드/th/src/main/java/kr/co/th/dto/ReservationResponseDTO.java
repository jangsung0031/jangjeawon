package kr.co.th.dto;

import kr.co.th.vo.Reservation;
import lombok.*;

import java.time.format.DateTimeFormatter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReservationResponseDTO {

    private Long id;
    private String username;
    private String status;
    private String checkInTime;
    private String checkOutTime;
    private int adults;
    private int children;
    private int infants;
    private String roomName;
    private String roomType;
    private int paidAmount;
    private String impUid;
    private String tel;


    public static ReservationResponseDTO fromEntity(Reservation r) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return ReservationResponseDTO.builder()
                .id(r.getId())
                .username(r.getUsername())
                .status(r.getStatus())
                .tel(r.getUser() != null ? r.getUser().getTel() : null)
                .checkInTime(r.getCheckInTime().format(formatter))
                .checkOutTime(r.getCheckOutTime().format(formatter))
                .adults(r.getAdults())
                .roomName(r.getRoomName())
                .children(r.getChildren())
                .infants(r.getInfants())
                .roomName(r.getRoom().getName())
                .roomType(r.getRoom().getType())
                .paidAmount(r.getPaidAmount())
                .impUid(r.getImpUid())
                .build();
    }
}

