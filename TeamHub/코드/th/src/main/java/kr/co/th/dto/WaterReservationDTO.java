package kr.co.th.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WaterReservationDTO {
    private Long id;
    private String reservationDate;
    private int peopleCount;
    private String ticketType;
    private String status;
    private int amount;
    private String username;
    private String tel;
}