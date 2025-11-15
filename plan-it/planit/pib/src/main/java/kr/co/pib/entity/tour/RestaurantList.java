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
@Table(name = "restaurant_list")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class RestaurantList {

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

    @Column(name = "inquiry_guide", columnDefinition = "TEXT")
    private String inquiryGuide; // 문의 및 안내

    @Column(name = "scale", length = 500)
    private String scale; // 규모

    @Column(name = "seat_count", length = 500)
    private String seatCount; // 좌석수

    @Column(name = "parking", length = 500)
    private String parking; // 주차 시설

    @Column(name = "childcare_center", length = 500)
    private String childcareCenter; // 어린이놀이방

    @Column(name = "dayon", length = 500)
    private String dayon; // 개업일

    @Column(name = "sell_time", length = 500)
    private String sellTime; // 영업시간

    @Column(name = "dayoff", length = 500)
    private String dayoff; // 쉬는날

    @Column(name = "represent_menu", length = 500)
    private String representMenu; // 대표메뉴

    @Column(name = "menus", columnDefinition = "TEXT")
    private String menus; // 취급메뉴

    @Column(name = "sale_info", length = 500)
    private String saleInfo; // 할인정보

    @Column(name = "smorking_yn", length = 500)
    private String smorkingYn; // 금연/흡연

    @Column(name = "card_info", length = 500)
    private String cardInfo; // 신용카드정보

    @Column(name = "packable", length = 500)
    private String packable; // 포장가능

    @Column(name = "reservation", length = 500)
    private String reservation; // 예약안내

    @Column(name = "detail", columnDefinition = "TEXT")
    private String detail; // 상세정보

    @Column(name = "license_number")
    private Long licenseNumber; // 인허가번호
}
