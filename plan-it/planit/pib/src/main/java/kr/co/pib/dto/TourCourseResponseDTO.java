package kr.co.pib.dto;

import kr.co.pib.entity.TourCourse;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TourCourseResponseDTO {
    private Long id;
    private Long userId;
    private String courseTitle;
    private String courseDesc;
    private LocalDateTime regDate;

    private String thumbnail; // 대표 이미지
    private int days;         // 총 일수

    // ✅ 추가: 리스트용 집계 필드
    private double avg;        // 평균 별점
    private long ratingCount;  // 별점 수
    private long commentCount; // 댓글 수

    // Entity → DTO 변환(기본 필드만 복사)
    public static TourCourseResponseDTO fromEntity(TourCourse course) {
        return TourCourseResponseDTO.builder()
                .id(course.getId())
                .userId(course.getUserId())
                .courseTitle(course.getCourseTitle())
                .courseDesc(course.getCourseDesc())
                .regDate(course.getRegDate())
                .build();
    }
}
