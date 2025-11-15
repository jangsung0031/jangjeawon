package kr.co.pib.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long uid;
    private String id;
    private String name;
    private String email;
    private String phone;
    private String nickname;
}
