package kr.co.pib.controller;

import kr.co.pib.repository.UserRepository;
import kr.co.pib.service.SmsService;
import kr.co.pib.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sms")
@RequiredArgsConstructor
public class SmsController {

    private final SmsService smsService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    // (구버전 - 가능하면 프론트에서 사용 안 하길 권장)
    @PostMapping("/send")
    public ResponseEntity<?> sendCode(@RequestBody Map<String, String> req) {
        smsService.sendVerificationCode(req.get("phone"));
        return ResponseEntity.ok("코드 전송");
    }

    // ✅ 아이디 찾기용: 이름+전화번호 매칭될 때만 발송 + 이름/전화번호 불일치 구분
    @PostMapping("/send/find-id")
    public ResponseEntity<?> sendCodeForFindId(@RequestBody Map<String, String> req) {
        String name  = req.get("name");
        String phone = req.get("phone");

        if (phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body("전화번호를 입력하세요.");
        }
        if (!userRepository.existsByPhone(phone)) {
            return ResponseEntity.status(404).body("일치하지 않는 전화번호입니다.");
        }
        // 이름 자체가 존재하지 않을 때
        if (!userRepository.existsByName(name)) {
            return ResponseEntity.status(404).body("일치하지 않는 이름입니다.");
        }
        // 이름은 존재하지만 해당 전화번호와 매칭되지 않을 때
        if (userRepository.findByNameAndPhone(name, phone).isEmpty()) {
            return ResponseEntity.status(404).body("일치하지 않는 사용자 정보입니다.");
        }

        smsService.sendVerificationCode(phone);
        return ResponseEntity.ok("코드 전송");
    }

    // ✅ 비밀번호 재설정용: 아이디+전화번호 매칭될 때만 발송 + 아이디/전화번호 불일치 구분
    @PostMapping("/send/reset-password")
    public ResponseEntity<?> sendCodeForResetPw(@RequestBody Map<String, String> req) {
        String id    = req.get("id");
        String phone = req.get("phone");

        if (phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body("전화번호를 입력하세요.");
        }
        if (!userRepository.existsByPhone(phone)) {
            return ResponseEntity.status(404).body("일치하지 않는 전화번호입니다.");
        }
        // 아이디 자체가 존재하지 않을 때
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(404).body("일치하지 않는 아이디입니다.");
        }
        // 아이디는 존재하지만 해당 전화번호와 매칭되지 않을 때
        if (userRepository.findByIdAndPhone(id, phone).isEmpty()) {
            return ResponseEntity.status(404).body("일치하지 않는 사용자 정보입니다.");
        }

        smsService.sendVerificationCode(phone);
        return ResponseEntity.ok("코드 전송");
    }

    // ✅ 인증번호 검증
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Boolean>> verifyCode(@RequestBody Map<String, String> req) {
        boolean success = smsService.verifyCode(req.get("phone"), req.get("code"));
        return ResponseEntity.ok(Map.of("success", success));
    }

    // ✅ 아이디 찾기 (조회 시에도 케이스별 메시지)
    @PostMapping("/find-id")
    public ResponseEntity<?> findId(@RequestBody Map<String, String> req) {
        String name  = req.get("name");
        String phone = req.get("phone");

        if (!userRepository.existsByPhone(phone)) {
            return ResponseEntity.status(404).body("일치하지 않는 전화번호입니다.");
        }
        if (!userRepository.existsByName(name)) {
            return ResponseEntity.status(404).body("일치하지 않는 이름입니다.");
        }

        return userRepository.findByNameAndPhone(name, phone)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(Map.of("userId", user.getId())))
                .orElseGet(() -> ResponseEntity.status(404).body("일치하지 않는 사용자 정보입니다."));
    }

    // ✅ 비밀번호 재설정 (실제 변경 시에도 케이스별 체크)
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPw(@RequestBody Map<String, String> req) {
        try {
            String id    = req.get("id");
            String phone = req.get("phone");
            String newPw = req.get("newPassword");

            if (!userRepository.existsByPhone(phone)) {
                return ResponseEntity.status(404).body("일치하지 않는 전화번호입니다.");
            }
            if (!userRepository.existsById(id)) {
                return ResponseEntity.status(404).body("일치하지 않는 아이디입니다.");
            }
            if (userRepository.findByIdAndPhone(id, phone).isEmpty()) {
                return ResponseEntity.status(404).body("일치하지 않는 사용자 정보입니다.");
            }

            userService.resetPassword(id, phone, newPw);
            return ResponseEntity.ok("변경 완료");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("정보 불일치");
        }
    }
}
