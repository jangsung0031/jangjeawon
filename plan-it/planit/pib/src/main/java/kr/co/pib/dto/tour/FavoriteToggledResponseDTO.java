package kr.co.pib.dto.tour;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FavoriteToggledResponseDTO {
    private final boolean favorited;
    private final long favoriteCount;
}
