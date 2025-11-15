package kr.co.pib.dto;

import lombok.*;
import kr.co.pib.entity.User;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfileResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String nickname;
    private LocalDate birthdate;
    private String role;
    private String profileUrl;

    public static UserProfileResponse from(User u) {
        return UserProfileResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .nickname(u.getNickname())
                .birthdate(u.getBirthdate())
                .role(u.getRole())
                .profileUrl(u.getProfileUrl())
                .build();
    }
}
