package kr.co.pib.entity.tour;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourUserActionsId implements Serializable {
    // userId + uniqueKey
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "unique_key", nullable = false)
    private String uniqueKey;
}