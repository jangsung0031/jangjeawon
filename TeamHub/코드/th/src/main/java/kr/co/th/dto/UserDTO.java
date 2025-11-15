package kr.co.th.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private String userid;
    private String username;
    private String email;
    private String tel;
    private String role;
}
