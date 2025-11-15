package kr.co.pib.dto;

import kr.co.pib.entity.TourCourse;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

@Getter @Setter
@Builder
public class TourCourseDetailDTO {
    private Long id;
    private String courseTitle;
    private String courseDesc;
    private List<TourCoursePlaceResponseDTO> places;

    public static TourCourseDetailDTO fromEntity(TourCourse course) {
        List<TourCoursePlaceResponseDTO> placeDtos = course.getPlaces().stream()
                .map(TourCoursePlaceResponseDTO::fromEntity)
                .collect(Collectors.toList());

        return TourCourseDetailDTO.builder()
                .id(course.getId())
                .courseTitle(course.getCourseTitle())
                .courseDesc(course.getCourseDesc())
                .places(placeDtos)
                .build();
    }
}