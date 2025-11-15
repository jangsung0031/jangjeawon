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
@Table(name = "tour_list")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class TourList {

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

    @Column(name = "legacy_yn", length = 500)
    private String legacyYn; // 유산구분

    @Column(name = "inquiry_guide", columnDefinition = "TEXT")
    private String inquiryGuide; // 문의 및 안내

    @Column(name = "opendate", length = 500)
    private String opendate; // 개장일

    @Column(name = "dayoff", length = 500)
    private String dayoff; // 쉬는날

    @Column(name = "exp_info", columnDefinition = "TEXT")
    private String expInfo; // 체험안내

    @Column(name = "exp_able", length = 500)
    private String expAble; // 체험가능연령

    @Column(name = "capacity", length = 500)
    private String capacity; // 수용인원

    @Column(name = "usedate", length = 500)
    private String usedate; // 이용시기

    @Column(name = "usetime", columnDefinition = "TEXT")
    private String usetime; // 이용시간

    @Column(name = "parking", length = 500)
    private String parking; // 주차시설

    @Column(name = "stroller_rental", length = 500)
    private String strollerRental; // 유모차 대여 여부

    @Column(name = "pet_with", length = 500)
    private String petWith; // 애완동물 동반 가능 여부

    @Column(name = "card_yn", length = 500)
    private String cardYn; // 신용카드 가능 여부

    @Column(name = "detail", columnDefinition = "TEXT")
    private String detail; // 상세정보
}
