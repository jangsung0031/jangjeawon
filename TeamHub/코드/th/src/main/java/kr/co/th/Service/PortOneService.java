package kr.co.th.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import kr.co.th.config.PortOneConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class PortOneService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final PortOneConfig portOneConfig;

    public String getAccessToken() {
        try {
            String url = "https://api.iamport.kr/users/getToken";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> bodyMap = new HashMap<>();
            bodyMap.put("imp_key", portOneConfig.getKey());
            bodyMap.put("imp_secret", portOneConfig.getSecret());

            ObjectMapper objectMapper = new ObjectMapper();
            String jsonBody = objectMapper.writeValueAsString(bodyMap);

            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            Map resBody = (Map) response.getBody().get("response");
            return (String) resBody.get("access_token");
        } catch (Exception e) {
            throw new RuntimeException("AccessToken 요청 실패: " + e.getMessage(), e);
        }
    }

    public boolean cancelPayment(String impUid) {
        try {
            if (impUid == null || impUid.trim().isEmpty()) {
                System.out.println("❌ imp_uid가 null이거나 빈 값입니다.");
                return false;
            }

            impUid = impUid.trim();
            System.out.println("🛑 (정제된) imp_uid 요청값: " + impUid);

            String token = getAccessToken();
            String url = "https://api.iamport.kr/payments/cancel";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            Map<String, Object> body = new HashMap<>();
            body.put("imp_uid", impUid);
            body.put("reason", "3일 전 예약 취소");

            ObjectMapper mapper = new ObjectMapper();
            String json = mapper.writeValueAsString(body);

            HttpEntity<String> entity = new HttpEntity<>(json, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            Map<String, Object> res = response.getBody();
            System.out.println("✅ 결제 취소 응답: " + res);

            Object code = res.get("code");
            if (code instanceof Integer && ((Integer) code) == 0) {
                System.out.println("✅ 결제 정상 취소");
                return true;
            } else {
                System.out.println("❌ 결제 취소 실패 - code: " + code + ", message: " + res.get("message"));
                return false;
            }
        } catch (Exception e) {
            System.out.println("❌ 예외 발생: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @PostConstruct
    public void checkKey() {
        System.out.println("🔐 imp_key: " + portOneConfig.getKey());
        System.out.println("🔐 imp_secret: " + portOneConfig.getSecret());
    }

    public int getPaidAmount(String impUid) {
        try {
            String token = getAccessToken();
            String url = "https://api.iamport.kr/payments/" + impUid;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<?> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            Map body = (Map) response.getBody().get("response");

            return (int) body.get("amount");
        } catch (Exception e) {
            throw new RuntimeException("결제 금액 조회 실패: " + e.getMessage(), e);
        }
    }
    public boolean requestPayment(kr.co.th.dto.ReservationRequestDTO.PaymentInfo paymentInfo) {
        try {
            String token = getAccessToken();
            String url = "https://api.iamport.kr/payments/prepare";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            Map<String, Object> body = new HashMap<>();
            body.put("merchant_uid", paymentInfo.getImpUid());
            body.put("amount", paymentInfo.getAmount());

            ObjectMapper mapper = new ObjectMapper();
            String json = mapper.writeValueAsString(body);

            HttpEntity<String> entity = new HttpEntity<>(json, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            Map<String, Object> res = response.getBody();
            System.out.println("✅ 결제 요청 응답: " + res);

            Object code = res.get("code");
            return code instanceof Integer && ((Integer) code) == 0;
        } catch (Exception e) {
            System.out.println("❌ 결제 요청 실패: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

}
