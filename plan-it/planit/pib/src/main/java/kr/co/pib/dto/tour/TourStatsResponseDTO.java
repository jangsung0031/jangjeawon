package kr.co.pib.dto.tour;

import kr.co.pib.entity.tour.TourStats;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TourStatsResponseDTO {
    private final long viewCount;
    private final long likeCount;
    private final long favoriteCount;

    public static TourStatsResponseDTO fromEntity(TourStats stats) {
        return TourStatsResponseDTO.builder()
                .viewCount(stats.getViewCount())
                .likeCount(stats.getLikeCount())
                .favoriteCount(stats.getFavoriteCount())
                .build();
    }
}
