package kr.co.pib.dto;

import kr.co.pib.entity.TourCoursePlace;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TourCoursePlaceResponseDTO {
    private Long id;
    private int day;
    private String title;
    private String addr;
    private String imageUrl;
    private String contentId;
    private String mapx;
    private String mapy;

    // Entity → DTO 변환
    public static TourCoursePlaceResponseDTO fromEntity(TourCoursePlace place) {
        return TourCoursePlaceResponseDTO.builder()
                .id(place.getId())
                .day(place.getDay())
                .title(place.getTitle())
                .addr(place.getAddr())
                .imageUrl(place.getImageUrl())
                .contentId(place.getContentId())
                .mapx(place.getMapx())
                .mapy(place.getMapy())
                .build();
    }
}
