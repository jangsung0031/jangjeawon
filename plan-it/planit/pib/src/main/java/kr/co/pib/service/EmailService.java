package kr.co.pib.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    // ✅ 세션 쿠키 없이도 인증 여부를 기억하기 위한 인메모리 저장소
    private final Set<String> verifiedEmails = ConcurrentHashMap.newKeySet();

    /** 인증 메일 전송 후 6자리 코드를 반환 */
    public String sendEmailCode(String toEmail) {
        String code = generateCode();

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("📧 Planit 인증번호 안내");
            helper.setFrom("your_email@gmail.com"); // TODO: 실제 발신계정으로 변경

            String html = "<div style='font-family:sans-serif;'>"
                    + "<h2>Planit 인증번호</h2>"
                    + "<p>아래 인증번호를 입력해 주세요:</p>"
                    + "<p style='font-size:24px; font-weight:bold; color:#007bff'>" + code + "</p>"
                    + "</div>";

            helper.setText(html, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("이메일 전송 실패: " + e.getMessage(), e);
        }

        return code;
    }

    /** 인증 성공 마킹 */
    public void markVerified(String email) {
        if (email != null) verifiedEmails.add(email);
    }

    /** 이메일이 인증되었는지 여부 */
    public boolean isVerified(String email) {
        return email != null && verifiedEmails.contains(email);
    }

    private String generateCode() {
        return String.valueOf(new Random().nextInt(900000) + 100000);
    }
}
