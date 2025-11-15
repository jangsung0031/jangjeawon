package kr.co.pib.dto;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourCourseRequest {
    private String courseTitle;
    private String courseDesc;
    private List<PlaceRequest> places;

    @Getter @Setter
    public static class PlaceRequest {
        private int day;
        private String title;
        private String addr;
        private String imageUrl;
        private String contentId;
        private String mapx;
        private String mapy;
    }
}
