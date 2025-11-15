package kr.co.pib.dto.tour;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TourActionCountDTO {
    private final long favoriteCount;
    private final long likeCount;
}