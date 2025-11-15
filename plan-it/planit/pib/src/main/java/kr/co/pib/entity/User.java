package kr.co.pib.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long uid;

    @Column(nullable = false, unique = true, length = 50)
    private String id;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(unique = true, length = 20)
    private String phone;

    @Column(unique = true, length = 50)
    private String nickname;

    @Column(nullable = false)
    private LocalDate birthdate;

    @Column(nullable = false, length = 20)
    private String role = "USER";

    @Column(length = 255)
    private String profileUrl;

    public String getProfileUrlOrDefault() {
        return (profileUrl == null || profileUrl.isBlank())
                ? "/images/avatar-default.png"
                : profileUrl;}

    @CreationTimestamp
    @Column(name = "reg_date", updatable = false)
    private LocalDateTime regDate;

}
