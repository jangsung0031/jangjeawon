package kr.co.pib.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class NewRatingReq {
    private int score; // 1~5
}
