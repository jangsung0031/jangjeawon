package kr.co.pib.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserUpdateRequest {
    private String nickname;
    private String phone;
    private String email;
    private String profileUrl;
    private String newPassword; // 비밀번호 변경 시 사용
}
