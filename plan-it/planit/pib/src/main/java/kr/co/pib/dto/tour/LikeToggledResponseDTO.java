package kr.co.pib.dto.tour;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LikeToggledResponseDTO {
    private final boolean liked;
    private final long likeCount;
}
