package kr.co.pib.controller;

import jakarta.servlet.http.HttpServletRequest;
import kr.co.pib.dto.LoginResponseDTO;
import kr.co.pib.dto.UserLoginRequest;
import kr.co.pib.dto.UserSignupRequest;
import kr.co.pib.entity.User;
import kr.co.pib.repository.UserRepository;
import kr.co.pib.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository usersRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody UserSignupRequest request, HttpServletRequest httpRequest) {
        // ✅ 세션 플래그
        Boolean sessionVerified = (Boolean) httpRequest.getSession()
                .getAttribute("emailVerified:" + request.getEmail());
        // ✅ 서비스(인메모리) 플래그
        boolean serviceVerified = userService.isEmailVerified(request.getEmail());

        if ((sessionVerified == null || !sessionVerified) && !serviceVerified) {
            return ResponseEntity.status(403).body("이메일 인증이 필요합니다.");
        }

        userService.signup(request);
        return ResponseEntity.ok("회원가입 완료");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginRequest request) {
        // ✅ 아이디 또는 이메일로 조회
        Optional<User> optionalUser =
                usersRepository.findById(request.getId())
                        .or(() -> usersRepository.findByEmail(request.getId()));

        if (optionalUser.isEmpty()) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of("error", "INVALID_ID", "message", "아이디가 존재하지 않습니다."));
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of("error", "INVALID_PASSWORD", "message", "비밀번호가 일치하지 않습니다."));
        }

        LoginResponseDTO response = userService.issueLoginResponse(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-nickname")
    public ResponseEntity<Map<String, Boolean>> checkNickname(@RequestParam String nickname) {
        boolean exists = userService.isNicknameDuplicate(nickname);
        return ResponseEntity.ok(Map.of("duplicate", exists));
    }

    // ✅ 이메일 중복 체크
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = userService.isEmailDuplicate(email);
        return ResponseEntity.ok(Map.of("duplicate", exists));
    }

    // ✅ 전화번호 중복 체크
    @GetMapping("/check-phone")
    public ResponseEntity<Map<String, Boolean>> checkPhone(@RequestParam String phone) {
        boolean exists = userService.isPhoneDuplicate(phone);
        return ResponseEntity.ok(Map.of("duplicate", exists));
    }
}
