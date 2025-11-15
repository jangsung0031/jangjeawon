package kr.co.pib.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSignupRequest {
    private String id;
    private String password;
    private String name;
    private String email;
    private String phone;
    private String nickname;
    private LocalDate birthdate;
}
