

package kr.co.th.Controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.*;
import java.util.Map;
import com.fasterxml.jackson.databind.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @PostMapping
    public Map<String, String> chat(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        String answer = callOpenAiApi(question);
        return Map.of("answer", answer);
    }

    private String callOpenAiApi(String prompt) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://openrouter.ai/api/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + openaiApiKey)
                    .header("HTTP-Referer", "http://localhost:80")
                    .header("X-Title", "TeamHub GPT")
                    .POST(HttpRequest.BodyPublishers.ofString("""
        {
          "model": "openai/gpt-3.5-turbo",
          "messages": [
            {"role": "user", "content": "%s"}
          ]
        }
        """.formatted(prompt)))
                    .build();


            HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            System.out.println("========= GPT 응답 시작 =========");
            System.out.println(response.body());
            System.out.println("========= GPT 응답 끝 =========");
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.body());
            return root.get("choices").get(0).get("message").get("content").asText();
        } catch (Exception e) {
            e.printStackTrace();
            return "GPT 응답 중 오류 발생";
        }
    }
}
