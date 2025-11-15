package kr.co.pib.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RatingSummaryDto {
    private double avg;
    private long count;
    private int my;
}
