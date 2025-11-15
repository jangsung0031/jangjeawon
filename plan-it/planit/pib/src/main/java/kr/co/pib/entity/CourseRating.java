package kr.co.pib.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "course_rating",
        uniqueConstraints = @UniqueConstraint(name = "uq_course_user", columnNames = {"courseId","userId"})
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CourseRating {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long courseId;  // tour_course.id

    @Column(nullable = false)
    private Long userId;    // users.uid

    @Column(nullable = false)
    private int score;      // 1~5

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PrePersist
    private void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    @PreUpdate
    private void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
