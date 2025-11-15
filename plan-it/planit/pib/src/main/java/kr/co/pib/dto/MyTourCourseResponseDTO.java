package kr.co.pib.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MyTourCourseResponseDTO {
    private Long id;
    private String title;
    private String addr;
    private String imageUrl;
}
