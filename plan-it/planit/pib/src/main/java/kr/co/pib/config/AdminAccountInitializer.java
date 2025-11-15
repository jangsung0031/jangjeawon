package kr.co.pib.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import kr.co.pib.entity.User;
import kr.co.pib.repository.UserRepository;

import java.sql.Date;

@Component
@RequiredArgsConstructor
public class AdminAccountInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void createAdminIfNotExists() {
        if (!userRepository.existsById("admin")) {
            User admin = new User();
            admin.setId("admin");
            admin.setPassword(passwordEncoder.encode("1111"));
            admin.setName("관리자");
            admin.setEmail("admin@planit.com");
            admin.setBirthdate(Date.valueOf("1990-01-01").toLocalDate());
            admin.setRole("ADMIN");

            userRepository.save(admin);
            System.out.println("✅ 관리자 계정(admin) 생성 완료!");
        } else {
            System.out.println("⚠️ 관리자 계정(admin)은 이미 존재합니다.");
        }
    }
}
