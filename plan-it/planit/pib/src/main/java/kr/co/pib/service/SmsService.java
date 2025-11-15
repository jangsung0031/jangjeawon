package kr.co.pib.service;

import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SmsService {

    private final Map<String, String> codeStore = new ConcurrentHashMap<>();
    private final DefaultMessageService messageService;

    @Value("${coolsms.api.key}")
    private String apiKey;

    @Value("${coolsms.api.secret}")
    private String apiSecret;

    @Value("${coolsms.sender.phone}")
    private String senderPhone;

    public SmsService(@Value("${coolsms.api.key}") String apiKey,
                      @Value("${coolsms.api.secret}") String apiSecret) {
        this.messageService = NurigoApp.INSTANCE.initialize(apiKey, apiSecret, "https://api.coolsms.co.kr");
    }

    public void sendVerificationCode(String phone) {
        String code = String.valueOf((int) (Math.random() * 900000) + 100000);
        codeStore.put(phone, code);

        // 실제 문자 전송
        Message message = new Message();
        message.setFrom(senderPhone);
        message.setTo(phone);
        message.setText("[Planit] 인증번호는 [" + code + "] 입니다.");

        try {
            messageService.send(message);
            System.out.println("✅ SMS 전송 완료: " + phone + " → " + code);
        } catch (Exception e) {
            System.err.println("❌ SMS 전송 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public boolean verifyCode(String phone, String code) {
        return code.equals(codeStore.get(phone));
    }
}
