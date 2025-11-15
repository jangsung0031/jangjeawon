package kr.co.pib.dto.tour;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CommonItemDTO {
    private String name; // 명칭
    private String intro; // 개요
    private String addr; // 주소
    private String city; // 도시
    private String sigungu; // 시군구
    private String uniqueKey; // 리액트 key값
    private Long likeCount; // 좋아요 수
}
