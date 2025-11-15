package kr.co.pib.dto.ai;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PlaceDto {

    private String title;
    private String description;
    private String category;
    private double mapx; // 유지: 지도 기능용
    private double mapy; // 유지: 지도 기능용
}