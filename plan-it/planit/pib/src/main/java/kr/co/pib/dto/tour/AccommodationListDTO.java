package kr.co.pib.dto.tour;

import kr.co.pib.entity.tour.AccommodationList;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AccommodationListDTO {

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
    private String accommodationType; // 숙박 종류
    private String inquiryGuide; // 문의 및 안내
    private String scale; // 규모
    private String capacity; // 수용 가능 인원
    private String roomCount; // 객실 수
    private String roomType; // 객실 유형
    private String parking; // 주차 가능
    private String cookable; // 조리 가능
    private String checkin; // 체크인
    private String checkout; // 체크아웃
    private String reservationIntro; // 예약 안내
    private String hp; // 예약안내 홈페이지
    private String pickup; // 픽업서비스
    private String foodcenter; // 식음료장
    private String subFac; // 부대 시설
    private String semina; // 세미나
    private String sportFac; // 스포츠시설
    private String saunaRoom; // 사우나실
    private String beautyFac; // 뷰티 시설
    private String musicRoom; // 노래방
    private String bbqPlace; // 바베큐장
    private String campfire; // 캠프화이어
    private String bicycleRental; // 자전거대여
    private String fitness; // 휘트니스센터
    private String commPcRoom; // 공용 PC실
    private String commShowerRoom; // 공용 샤워실
    private String detail; // 상세정보
    private String refundReg; // 환불규정


    // Entity 객체를 DTO로 변환하는 정적 팩토리 메소드 (응답용)
    public static AccommodationListDTO fromEntity(AccommodationList entity) {
        return AccommodationListDTO.builder()
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
                .accommodationType(entity.getAccommodationType())
                .inquiryGuide(entity.getInquiryGuide())
                .scale(entity.getScale())
                .capacity(entity.getCapacity())
                .roomCount(entity.getRoomCount())
                .roomType(entity.getRoomType())
                .parking(entity.getParking())
                .cookable(entity.getCookable())
                .checkin(entity.getCheckin())
                .checkout(entity.getCheckout())
                .reservationIntro(entity.getReservationIntro())
                .hp(entity.getHp())
                .pickup(entity.getPickup())
                .foodcenter(entity.getFoodcenter())
                .subFac(entity.getSubFac())
                .semina(entity.getSemina())
                .sportFac(entity.getSportFac())
                .saunaRoom(entity.getSaunaRoom())
                .beautyFac(entity.getBeautyFac())
                .musicRoom(entity.getMusicRoom())
                .bbqPlace(entity.getBbqPlace())
                .campfire(entity.getCampfire())
                .bicycleRental(entity.getBicycleRental())
                .fitness(entity.getFitness())
                .commPcRoom(entity.getCommPcRoom())
                .commShowerRoom(entity.getCommShowerRoom())
                .detail(entity.getDetail())
                .refundReg(entity.getRefundReg())
                .build();
    }
}
