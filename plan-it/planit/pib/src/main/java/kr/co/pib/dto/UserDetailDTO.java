package kr.co.pib.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** 관리자 상세 DTO */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailDTO {
    private Long uid;
    private String name;
    private String id;                 // 로그인 아이디
    private String email;
    private String nickname;
    private String phone;
    private LocalDate birthdate;
    private LocalDateTime regDate;     // 가입일
    private LocalDateTime deletedAt;   // 탈퇴일 (활성 사용자는 null)
}
