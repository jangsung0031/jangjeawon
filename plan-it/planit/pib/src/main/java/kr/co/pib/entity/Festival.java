package kr.co.pib.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "festivallist")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Festival {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // 기본 정보 (DB: snake_case)
    private String city;
    private String sigungu;
    private String name;
    private String zipcode;
    private String manager;

    // ☑ 전화/연락처: 길이 이슈 → TEXT로 고정
    @Column(columnDefinition = "TEXT")
    private String tel;

    private String addr;

    // 좌표는 DB가 varchar라 String 유지 (필요시 Double로 변경 가능)
    private String latitude;
    private String longitude;

    // 소개/텍스트류는 TEXT
    @Column(columnDefinition = "TEXT")
    private String intro;

    // 스네이크 케이스 매핑
    @Column(name = "sponsor_arae")
    private String sponsorArae;

    // ☑ 길이 이슈 → TEXT
    @Column(name = "sponsor_tel1", columnDefinition = "TEXT")
    private String sponsorTel1;

    @Column(name = "sponsor_info")
    private String sponsorInfo;

    // ☑ 길이 이슈 가능 → TEXT
    @Column(name = "sponsor_tel2", columnDefinition = "TEXT")
    private String sponsorTel2;

    // 날짜는 현재 String으로 두어 파싱이슈 회피(데이터 정제 후 LocalDate로 전환 권장)
    @Column(name = "startdate")
    private String startdate;

    @Column(name = "enddate")
    private String enddate;

    @Column(columnDefinition = "TEXT", name = "starttime")
    private String starttime;

    @Column(columnDefinition = "TEXT", name = "eventplace")
    private String eventplace;

    // ☑ URL/설명 혼재 가능 → TEXT
    @Column(columnDefinition = "TEXT")
    private String eventhp;

    @Column(columnDefinition = "TEXT")
    private String cost;

    @Column(columnDefinition = "TEXT")
    private String sale;

    // required_time 스네이크케이스 매핑 + TEXT
    @Column(name = "required_time", columnDefinition = "TEXT")
    private String requiredTime;

    @Column(name = "required_age")
    private String requiredAge;

    @Column(name = "reservation_office")
    private String reservationOffice;

    @Column(columnDefinition = "TEXT")
    private String location;

    private String sideevent;
    private String program;

    @Column(columnDefinition = "TEXT")
    private String detail;

    private String progressive;
    private String festival;

    // 이미지 경로 (DB: image_path). DB는 varchar(255/500)인데 문자열이면 충분
    @Column(name = "image_path")
    private String imagePath;
}
