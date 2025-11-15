package kr.co.pib.dto.tour;

import kr.co.pib.entity.tour.CultureList;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CultureListDTO {

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
    private String capacity; // 수용인원
    private String usedate; // 이용시간
    private String dayoff; // 쉬는날
    private String useCost; // 이용요금
    private String saleInfo; // 할인정보
    private String showTime; // 관람소요시간
    private String parking; // 주차시설
    private String parkingCost; // 주차요금
    private String strollerRental; // 유모차 대여 여부
    private String petWith; // 애완동물 동반 가능 여부
    private String cardYn; // 신용카드 가능 여부
    private String detail; // 상세정보

    /**
     * Entity 객체를 DTO로 변환하는 정적 팩토리 메소드 (응답용)
     */
    public static CultureListDTO fromEntity(CultureList entity) {
        return CultureListDTO.builder()
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
                .capacity(entity.getCapacity())
                .usedate(entity.getUsetime())
                .dayoff(entity.getDayoff())
                .useCost(entity.getUseCost())
                .saleInfo(entity.getSaleInfo())
                .showTime(entity.getShowTime())
                .parking(entity.getParking())
                .parkingCost(entity.getParkingCost())
                .strollerRental(entity.getStrollerRental())
                .petWith(entity.getPetWith())
                .cardYn(entity.getCardYn())
                .detail(entity.getDetail())
                .build();
    }
}
