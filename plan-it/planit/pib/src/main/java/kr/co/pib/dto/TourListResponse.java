package kr.co.pib.dto;

import lombok.Data;
import java.util.List;

@Data
public class TourListResponse {
    private Response response;

    @Data
    public static class Response {
        private Body body;
    }

    @Data
    public static class Body {
        private Items items;
    }

    @Data
    public static class Items {
        private List<TourListItem> item;
    }

    @Data
    public static class TourListItem {
        private String insertDate; // 등록일
        private String title; // 여행지 이름
        private String description; // 여행지 설명
        private String url; // 여행지 url
        private String reference; // 여행지 연락처
        private String spatialCoverage; // 여행지 주소
        private String referenceIdentifier; // 여행지 사진
    }
}
