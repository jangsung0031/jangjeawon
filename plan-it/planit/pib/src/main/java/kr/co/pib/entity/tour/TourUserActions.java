package kr.co.pib.entity.tour;

import jakarta.persistence.*;
import kr.co.pib.entity.User;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tour_user_actions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourUserActions {
    // 여행지 데이터의 uniqueKey + userId
    @EmbeddedId
    private TourUserActionsId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId") // 복합키의 userId를 FK로 연결
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder.Default
    @Column(name = "liked", nullable = false)
    private boolean liked = false;

    @Builder.Default
    @Column(name = "favorited", nullable = false)
    private boolean favorited = false;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
