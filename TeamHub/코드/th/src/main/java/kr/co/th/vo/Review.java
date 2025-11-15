package kr.co.th.vo;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "review")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Long targetId;

    @Column(nullable = false)
    private int rating; // 별점 (1~5)

    @Column(nullable = false, length = 1000)
    private String content;

    private String imageName;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Column(length = 1000, columnDefinition = "TEXT")
    private String reply; // 관리자 답글

    @Column(nullable = false)
    private boolean reported = false; // 신고 여부
}