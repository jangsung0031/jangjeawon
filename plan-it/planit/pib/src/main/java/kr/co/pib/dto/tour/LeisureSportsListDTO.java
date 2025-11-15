package kr.co.pib.dto.tour;

import kr.co.pib.entity.tour.LeisureSportsList;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LeisureSportsListDTO {

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
    private String dayoff; // 쉬는날
    private String openTerm; // 개장기간
    private String usetime; // 이용시간
    private String enterCost; // 입장료
    private String expAble; // 체험가능연령
    private String parking; // 주차시설
    private String parkingCost; // 주차요금
    private String strollerRental; // 유모차 대여 여부
    private String petWith; // 애완동물 동반 가능 여부
    private String cardYn; // 신용카드 가능 여부
    private String detail; // 상세정보


    public static LeisureSportsListDTO fromEntity(LeisureSportsList entity) {
        return LeisureSportsListDTO.builder()
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
                .dayoff(entity.getDayoff())
                .openTerm(entity.getOpenTerm())
                .usetime(entity.getUsetime())
                .enterCost(entity.getEnterCost())
                .expAble(entity.getExpAble())
                .parking(entity.getParking())
                .parkingCost(entity.getParkingCost())
                .strollerRental(entity.getStrollerRental())
                .petWith(entity.getPetWith())
                .cardYn(entity.getCardYn())
                .detail(entity.getDetail())
                .build();
    }
}
