// kr/co/pib/entity/CourseComment.java
package kr.co.pib.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "course_comment")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CourseComment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 50)
    private String authorNickname;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ✅ 숨김 여부 (삭제 대신 사용)
    @Builder.Default
    @Column(nullable = false)
    private boolean hidden = false;

    @PrePersist
    private void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
