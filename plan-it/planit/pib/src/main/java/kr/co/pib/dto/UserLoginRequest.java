package kr.co.pib.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginRequest {
    private String id;
    private String password;
}
