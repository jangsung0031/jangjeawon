package kr.co.pib.entity;

import jakarta.persistence.*;
import kr.co.pib.entity.TourCoursePlace;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "tour_course")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String courseTitle;

    @Column(columnDefinition = "TEXT")
    private String courseDesc;

    @CreationTimestamp
    @Column(name = "reg_date", updatable = false)
    private LocalDateTime regDate;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TourCoursePlace> places;
}
