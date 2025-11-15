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
@Table(name = "shopping_list")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ShoppingList {

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

    @Column(name = "sell_items", length = 500)
    private String sellItems; // 판매품목

    @Column(name = "price", length = 500)
    private String price; // 품목별 가격

    @Column(name = "dayon", length = 500)
    private String dayon; // 장서는 날

    @Column(name = "opendate", length = 500)
    private String opendate; // 개장일

    @Column(name = "salestime", length = 500)
    private String salestime; // 영업시간

    @Column(name = "dayoff", length = 500)
    private String dayoff; // 쉬는날

    @Column(name = "shopintro", columnDefinition = "TEXT")
    private String shopintro; // 매장안내

    @Column(name = "parking", length = 500)
    private String parking; // 주차시설

    @Column(name = "culturecenter", length = 500)
    private String culturecenter; // 문화센터 바로가기

    @Column(name = "stroller_rental", length = 500)
    private String strollerRental; // 유모차 대여 여부

    @Column(name = "pet_with", length = 500)
    private String petWith; // 애완동물 동반 가능 여부

    @Column(name = "card_yn", length = 500)
    private String cardYn; // 신용카드 가능 여부

    @Column(name = "toilet", length = 500)
    private String toilet; // 화장실

    @Column(name = "detail", columnDefinition = "TEXT")
    private String detail; // 상세정보
}
