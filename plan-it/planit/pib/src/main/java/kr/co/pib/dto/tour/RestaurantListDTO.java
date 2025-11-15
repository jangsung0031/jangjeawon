package kr.co.pib.dto.tour;

import kr.co.pib.entity.tour.RestaurantList;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RestaurantListDTO {

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
    private String seatCount; // 좌석수
    private String parking; // 주차 시설
    private String childcareCenter; // 어린이놀이방
    private String dayon; // 개업일
    private String sellTime; // 영업시간
    private String dayoff; // 쉬는날
    private String representMenu; // 대표메뉴
    private String menus; // 취급메뉴
    private String saleInfo; // 할인정보
    private String smorkingYn; // 금연/흡연
    private String cardInfo; // 신용카드정보
    private String packable; // 포장가능
    private String reservation; // 예약안내
    private String detail; // 상세정보
    private Long licenseNumber; // 인허가번호

    public static RestaurantListDTO fromEntity(RestaurantList entity) {
        return RestaurantListDTO.builder()
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
                .seatCount(entity.getSeatCount())
                .parking(entity.getParking())
                .childcareCenter(entity.getChildcareCenter())
                .dayon(entity.getDayon())
                .sellTime(entity.getSellTime())
                .dayoff(entity.getDayoff())
                .representMenu(entity.getRepresentMenu())
                .menus(entity.getMenus())
                .saleInfo(entity.getSaleInfo())
                .smorkingYn(entity.getSmorkingYn())
                .cardInfo(entity.getCardInfo())
                .packable(entity.getPackable())
                .reservation(entity.getReservation())
                .detail(entity.getDetail())
                .licenseNumber(entity.getLicenseNumber())
                .build();
    }
}
