package kr.co.pib.entity.tour;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tour_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourStats { // 여행지별 조회수/추천/즐겨찾기 집계용 엔티티
    // 여행지 데이터의 uniqueKey
    @Id
    private String id;
    // 조회수 집계
    @Builder.Default
    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;
    // 추천 집계
    @Builder.Default
    @Column(name = "like_count", nullable = false)
    private Long likeCount = 0L;
    // 즐겨찾기 집계
    @Builder.Default
    @Column(name = "favorite_count", nullable = false)
    private Long favoriteCount = 0L;
    // 조회수 상승
    public void incrementView() {
        this.viewCount++;
    }
    // 추천 상승
    public void incrementLike() {
        this.likeCount++;
    }
    // 추천 하락 -> 0 이하가 아닐 경우만 하락함
    public void decrementLike() {
        if (this.likeCount > 0) this.likeCount--;
    }
    // 즐겨찾기 상승
    public void incrementFavorite() {
        this.favoriteCount++;
    }
    // 즐겨찾기 하락 -> 0 이하가 아닐 경우만 하락함
    public void decrementFavorite() {
        if (this.favoriteCount > 0) this.favoriteCount--;
    }
}
