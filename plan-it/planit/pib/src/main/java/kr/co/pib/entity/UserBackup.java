package kr.co.pib.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_backup")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBackup {

    @Id
    private Long uid;

    @Column(nullable = false, length = 50)
    private String id;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 50)
    private String nickname;

    @Column(nullable = false)
    private LocalDate birthdate;

    @Column(nullable = false, length = 20)
    private String role;

    @Column(length = 255)
    private String profileUrl;

    @Column(name = "original_reg_date", updatable = false)
    private LocalDateTime originalRegDate;

    @CreationTimestamp
    @Column(name = "deleted_at", updatable = false)
    private LocalDateTime deletedAt;

    public static UserBackup from(User user) {
        return UserBackup.builder()
                .uid(user.getUid())
                .id(user.getId())
                .password(user.getPassword())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .nickname(user.getNickname())
                .birthdate(user.getBirthdate())
                .role(user.getRole())
                .profileUrl(user.getProfileUrl())
                .originalRegDate(user.getRegDate())
                .build();
    }
}