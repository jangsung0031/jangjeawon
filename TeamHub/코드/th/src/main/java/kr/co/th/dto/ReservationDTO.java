package kr.co.th.dto;

import lombok.*;


@Data
public class ReservationDTO {
    private Long userId;
    private String reservationDate;
    private int peopleCount;
    private String ticketType;

    private String imp_uid;
    private String merchant_uid;
    private int paid_amount;
}


