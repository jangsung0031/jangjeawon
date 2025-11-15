package kr.co.pib.entity.tour;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "accommodation_list")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class AccommodationList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "city", length = 50)
    private String city; // 도시

    @Column(name = "sigungu", length = 50)
    private String sigungu; // 시군구

    @Column(name = "name", length = 500)
    private String name; // 명칭

    @Column(name = "zipcode", length = 50)
    private String zipcode; // 우편번호

    @Column(name = "manager", length = 100)
    private String manager; // 관리자

    @Column(name = "tel", length = 100)
    private String tel; // 전화번호

    @Column(name = "addr", length = 500)
    private String addr; // 주소

    @Column(name = "latitude", length = 500)
    private String latitude; // 위도

    @Column(name = "longitude", length = 500)
    private String longitude; // 경도

    @Column(name = "intro", columnDefinition = "TEXT")
    private String intro; // 개요

    @Column(name = "accommodation_type", length = 300)
    private String accommodationType; // 숙박 종류

    @Column(name = "inquiry_guide", columnDefinition = "TEXT")
    private String inquiryGuide; // 문의 및 안내

    @Column(name = "scale", columnDefinition = "TEXT")
    private String scale; // 규모

    @Column(name = "capacity", length = 300)
    private String capacity; // 수용 가능 인원

    @Column(name = "room_count", length = 300)
    private String roomCount; // 객실 수

    @Column(name = "room_type", length = 300)
    private String roomType; // 객실 유형

    @Column(name = "parking", length = 200)
    private String parking; // 주차 가능

    @Column(name = "cookable", length = 300)
    private String cookable; // 조리 가능

    @Column(name = "checkin", length = 300)
    private String checkin; // 체크인

    @Column(name = "checkout", length = 300)
    private String checkout; // 체크아웃

    @Column(name = "reservation_intro", columnDefinition = "TEXT")
    private String reservationIntro; // 예약 안내

    @Column(name = "hp", length = 500)
    private String hp; // 예약안내 홈페이지

    @Column(name = "pickup", length = 300)
    private String pickup; // 픽업서비스

    @Column(name = "foodcenter", length = 300)
    private String foodcenter; // 식음료장

    @Column(name = "sub_fac", length = 300)
    private String subFac; // 부대 시설

    @Column(name = "semina", length = 300)
    private String semina; // 세미나

    @Column(name = "sport_fac", length = 300)
    private String sportFac; // 스포츠시설

    @Column(name = "sauna_room", length = 300)
    private String saunaRoom; // 사우나실

    @Column(name = "beauty_fac", length = 300)
    private String beautyFac; // 뷰티 시설

    @Column(name = "music_room", length = 300)
    private String musicRoom; // 노래방

    @Column(name = "bbq_place", length = 300)
    private String bbqPlace; // 바베큐장

    @Column(name = "campfire", length = 300)
    private String campfire; // 캠프파이어

    @Column(name = "bicycle_rental", length = 300)
    private String bicycleRental; // 자전거대여

    @Column(name = "fitness", length = 300)
    private String fitness; // 휘트니스센터

    @Column(name = "comm_pc_room", length = 300)
    private String commPcRoom; // 공용 PC실

    @Column(name = "comm_shower_room", length = 300)
    private String commShowerRoom; // 공용 샤워실

    @Column(name = "detail", columnDefinition = "TEXT")
    private String detail; // 상세정보

    @Column(name = "refund_reg", columnDefinition = "TEXT")
    private String refundReg; // 환불규정
}

