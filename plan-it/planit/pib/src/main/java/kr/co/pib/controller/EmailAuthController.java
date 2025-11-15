package kr.co.pib.controller;

import jakarta.servlet.http.HttpServletRequest;
import kr.co.pib.dto.VerifyRequest;
import kr.co.pib.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class EmailAuthController {

    private final EmailService emailService;

    // 인증번호 발송
    @PostMapping("/send-email-code")
    public CodeResponse sendEmailCode(@RequestBody EmailRequest emailRequest, HttpServletRequest request) {
        String email = emailRequest.getEmail();
        String code = emailService.sendEmailCode(email);

        // ✅ 세션에도 저장(기존 방식 유지)
        request.getSession(true).setAttribute("emailCode:" + email, code);
        // 재요청 시 이전 인증 플래그 제거
        request.getSession().removeAttribute("emailVerified:" + email);

        return new CodeResponse(code);
    }

    // 인증번호 확인
    @PostMapping("/verify-email-code")
    public ResponseEntity<String> verifyEmailCode(@RequestBody VerifyRequest req, HttpServletRequest request) {
        String email = req.getEmail();
        String expected = (String) request.getSession(true).getAttribute("emailCode:" + email);

        if (expected != null && expected.equals(req.getCode())) {
            // ✅ 세션 플래그 유지
            request.getSession().setAttribute("emailVerified:" + email, true);
            // ✅ 세션이 없어도 통과하게 서비스에도 인증 마킹
            emailService.markVerified(email);
            return ResponseEntity.ok("이메일 인증 성공");
        } else {
            return ResponseEntity.status(400).body("인증번호 불일치");
        }
    }

    @Data
    public static class EmailRequest {
        private String email;
    }

    @Data
    public static class CodeResponse {
        private final String code;
    }
}
