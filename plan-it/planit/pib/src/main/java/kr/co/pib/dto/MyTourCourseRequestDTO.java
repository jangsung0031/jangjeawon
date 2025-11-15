package kr.co.pib.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MyTourCourseRequestDTO {
    private String title;
    private String addr;
    private String imageUrl;
    private String contentId;
    private String mapx;
    private String mapy;
}
