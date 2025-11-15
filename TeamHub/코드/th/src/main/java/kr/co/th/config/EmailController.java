package kr.co.th.config;


import kr.co.th.Service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/email")
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/send")
    public Map<String, String> sendEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = emailService.sendCode(email);

        Map<String, String> response = new HashMap<>();
        response.put("code", code);
        return response;
    }
}

