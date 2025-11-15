package kr.co.th.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
@Setter
public class ReservationRequestDTO {

    private Long roomId;
    private Long userId;
    private String username;

    private String checkIn;
    private String checkOut;

    private int nights;
    private int adults;
    private int children;
    private int infants;

    @JsonProperty("imp_uid")
    private String impUid;

    @JsonProperty("paid_amount")
    private int paidAmount;

    public LocalDateTime getCheckInTime() {
        return LocalDateTime.parse(checkIn, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }

    public LocalDateTime getCheckOutTime() {
        return LocalDateTime.parse(checkOut, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }

    public PaymentInfo getPaymentInfo() {
        PaymentInfo paymentInfo = new PaymentInfo();
        paymentInfo.setImpUid(impUid);
        paymentInfo.setAmount(paidAmount);
        paymentInfo.setBuyerName(username);
        return paymentInfo;
    }

    @Getter
    @Setter
    public static class PaymentInfo {
        private String impUid;
        private int amount;
        private String buyerName;
    }
}
