package kr.co.pib.dto;

import lombok.Data;
import java.util.List;

@Data
public class FestivalResponse {
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
        private List<Item> item;
    }

    @Data
    public static class Item {
        private String contentid;
        private String title;
        private String addr1;
        private String addr2;
        private String firstimage;
        private String eventstartdate;
        private String eventenddate;
        private String tel;
        private String overview;
    }
}
