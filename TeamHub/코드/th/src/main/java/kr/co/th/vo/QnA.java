package kr.co.th.vo;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "qna")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QnA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 255)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    @Lob
    private String answer;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private QnAStatus status;

    @Column(name = "is_private", columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean isPrivate;


    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.status = QnAStatus.PENDING;
    }

    public enum QnAStatus {
        PENDING,
        ANSWERED
    }
}
