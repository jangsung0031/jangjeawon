package kr.co.th.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public String sendCode(String toEmail) {
        String code = makeRandomCode();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setFrom("teamhub8833@gmail.com");
        message.setSubject("회원가입 인증번호");
        message.setText("인증번호: " + code);

        mailSender.send(message);
        return code;
    }

    private String makeRandomCode() {
        return String.valueOf(new Random().nextInt(900000) + 100000);
    }
}
