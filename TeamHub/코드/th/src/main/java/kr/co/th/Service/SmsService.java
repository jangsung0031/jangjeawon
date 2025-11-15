package kr.co.th.Service;

import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.response.SingleMessageSentResponse;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class SmsService {

    private final DefaultMessageService messageService;

    public SmsService() {
        this.messageService = NurigoApp.INSTANCE.initialize(
                "NCSID2W4FVAVBUX7",
                "UV71TXP20C9J8M6QTHIXBLAO2WFRY2IA",
                "https://api.coolsms.co.kr"
        );
    }

    public String sendCode(String tel) {
        String code = generateCode();

        Message message = new Message();
        message.setFrom("01074340737");
        message.setTo(tel);
        message.setText("[TeamHub] 인증번호는 [" + code + "] 입니다.");

        try {
            SingleMessageSentResponse response = messageService.sendOne(new SingleMessageSendingRequest(message));
            System.out.println("SMS 전송 성공: " + response);
        } catch (Exception e) {
            System.err.println("SMS 전송 실패: " + e.getMessage());
        }

        return code;
    }

    private String generateCode() {
        Random rand = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(rand.nextInt(10));
        }
        return code.toString();
    }
}
