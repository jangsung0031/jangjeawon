package kr.co.pib.controller;

import jakarta.validation.Valid;
import kr.co.pib.dto.UserProfileResponse;
import kr.co.pib.dto.UserUpdateRequest;
import kr.co.pib.entity.User;
import kr.co.pib.repository.UserRepository;
import kr.co.pib.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UsersController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    // 내 정보 조회
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(Authentication auth) {
        // SecurityContext에서 로그인 ID 꺼내기
        String loginId = auth.getName(); // = UserDetails.getUsername()
        User user = userRepository.findById(loginId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        return ResponseEntity.ok(UserProfileResponse.from(user));
    }

    // 내 정보 수정
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMe(
            Authentication auth,
            @Valid @RequestBody UserUpdateRequest req
    ) {
        String loginId = auth.getName();
        User user = userRepository.findById(loginId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 수정 가능한 필드만 업데이트 (예시: nickname, phone, password, profileUrl 등)
        if (req.getNickname() != null) user.setNickname(req.getNickname());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getEmail() != null) user.setEmail(req.getEmail());
        if (req.getProfileUrl() != null) user.setProfileUrl(req.getProfileUrl());

        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            // 필요 시 현재 비밀번호 검증 로직 추가 가능
            user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        }

        userRepository.save(user);
        return ResponseEntity.ok(UserProfileResponse.from(user));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> deleteMe(Authentication auth) {
        String loginId = auth.getName();

        userService.deleteUser(loginId);

        return ResponseEntity.ok(Map.of("message", "회원 탈퇴가 성공적으로 처리되었습니다."));
    }
}
