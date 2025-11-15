package kr.co.pib.dto.tour;

import kr.co.pib.entity.tour.ShoppingList;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ShoppingListDTO {

    private Long id; // ID (조회 시 사용)
    private String city; // 도시
    private String sigungu; // 시군구
    private String name; // 명칭
    private String zipcode; // 우편번호
    private String manager; // 관리자
    private String tel; // 전화번호
    private String addr; // 주소
    private String latitude; // 위도
    private String longitude; // 경도
    private String intro; // 개요
    private String inquiryGuide; // 문의 및 안내
    private String scale; // 규모
    private String sellItems; // 판매품목
    private String price; // 품목별 가격
    private String dayon; // 장서는 날
    private String opendate; // 개장일
    private String salestime; // 영업시간
    private String dayoff; // 쉬는날
    private String shopintro; // 매장안내
    private String parking; // 주차시설
    private String culturecenter; // 문화센터 바로가기
    private String strollerRental; // 유모차 대여 여부
    private String petWith; // 애완동물 동반 가능 여부
    private String cardYn; // 신용카드 가능 여부
    private String toilet; // 화장실
    private String detail; // 상세정보

    public static ShoppingListDTO fromEntity(ShoppingList entity) {
        return ShoppingListDTO.builder()
                .id(entity.getId())
                .city(entity.getCity())
                .sigungu(entity.getSigungu())
                .name(entity.getName())
                .zipcode(entity.getZipcode())
                .manager(entity.getManager())
                .tel(entity.getTel())
                .addr(entity.getAddr())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .intro(entity.getIntro())
                .inquiryGuide(entity.getInquiryGuide())
                .scale(entity.getScale())
                .sellItems(entity.getSellItems())
                .price(entity.getPrice())
                .dayon(entity.getDayon())
                .opendate(entity.getOpendate())
                .salestime(entity.getSalestime())
                .dayoff(entity.getDayoff())
                .shopintro(entity.getShopintro())
                .parking(entity.getParking())
                .culturecenter(entity.getCulturecenter())
                .strollerRental(entity.getStrollerRental())
                .petWith(entity.getPetWith())
                .cardYn(entity.getCardYn())
                .toilet(entity.getToilet())
                .detail(entity.getDetail())
                .build();
    }
}
