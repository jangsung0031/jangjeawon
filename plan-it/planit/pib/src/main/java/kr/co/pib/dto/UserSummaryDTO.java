package kr.co.pib.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** 관리자 목록 요약 DTO */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDTO {
    private Long uid;
    private String name;
    private String id;                // 로그인 아이디
    private LocalDateTime regDate;    // 가입일
    private LocalDateTime deletedAt;  // 탈퇴일(활성 목록에선 null)
}
