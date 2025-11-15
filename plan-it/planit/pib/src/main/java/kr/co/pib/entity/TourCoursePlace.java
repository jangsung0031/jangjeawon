package kr.co.pib.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tour_course_place")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourCoursePlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int day;

    private String title;

    private String addr;

    private String imageUrl;

    private String contentId;

    private String mapx;

    private String mapy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private TourCourse course;
}
