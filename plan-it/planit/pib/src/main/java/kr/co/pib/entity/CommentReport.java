package kr.co.pib.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "comment_report",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_comment_report_commentId_reporterId", columnNames = {"comment_id","reporter_id"})
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CommentReport {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "comment_id", nullable = false)
    private Long commentId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    @Column(name = "reporter_nickname", length = 50)
    private String reporterNickname;

    @Column(name = "reason", length = 500)
    private String reason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
