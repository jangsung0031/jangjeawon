package kr.co.th.Controller;

import kr.co.th.Repository.UserRepository;
import kr.co.th.Service.SmsService;
import kr.co.th.vo.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/sms")
@RequiredArgsConstructor
public class SmsController {

    private final UserRepository userRepository;
    private final SmsService smsService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendSms(@RequestBody Map<String, String> payload) {
        String userid = payload.get("userid");
        String tel = payload.get("tel");

        Optional<User> user = userRepository.findByUserid(userid);
        if (user.isEmpty() || !user.get().getTel().equals(tel)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "회원정보 불일치"));
        }

        String code = smsService.sendCode(tel);
        return ResponseEntity.ok(Map.of("code", code));
    }
}
