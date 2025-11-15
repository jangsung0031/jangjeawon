package kr.co.pib.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kr.co.pib.dto.ai.AskRequestDto;
import kr.co.pib.dto.ai.MessageResponseDto;
import kr.co.pib.dto.ai.ScheduleDayDto;
import kr.co.pib.entity.AiConversation;
import kr.co.pib.entity.AiMessage;
import kr.co.pib.entity.User;
import kr.co.pib.repository.AiConversationRepository;
import kr.co.pib.repository.AiMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final AiConversationRepository conversationRepository;
    private final AiMessageRepository messageRepository;

    private static final String OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

    @Transactional
    public MessageResponseDto getResponse(AskRequestDto requestDto, User currentUser) {
        String userQuery = requestDto.getQuestion();
        AiConversation conversation = findOrCreateConversation(requestDto.getChatroomId(), userQuery, currentUser);
        saveUserMessage(conversation, userQuery);

        List<AiMessage> history = messageRepository.findTop10ByConversationOrderByDatetimeAsc(conversation);
        List<Map<String, String>> messages = new ArrayList<>();
        for (AiMessage msg : history) {
            String role = "ai".equals(msg.getActor()) ? "assistant" : msg.getActor();
            String content = extractContentFromJson(msg.getContent());
            if (!content.isEmpty()) {
                messages.add(Map.of("role", role, "content", content));
            }
        }

        String finalAiJsonResponse = "";
        try {
            finalAiJsonResponse = generateFinalPlanFromData(messages);
            finalAiJsonResponse = finalAiJsonResponse.trim();

            AiMessage aiMessage = saveAiMessage(conversation, finalAiJsonResponse);

            JsonNode rootNode = objectMapper.readTree(finalAiJsonResponse);
            String markdownContent = rootNode.path("content").asText("답변을 처리하는 데 실패했습니다.");
            List<ScheduleDayDto> schedule = objectMapper.convertValue(
                    rootNode.path("schedule"),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, ScheduleDayDto.class)
            );

            return new MessageResponseDto(aiMessage.getId(), markdownContent, aiMessage.getActor(),
                    aiMessage.getDatetime(), schedule, conversation.getChatroomId());

        } catch (Exception e) {
            log.error("AI 응답 처리 또는 JSON 파싱 실패!", e);
            log.error("처리 실패한 AI 원본 응답: {}", finalAiJsonResponse);
            String errorMessage = "**죄송합니다. 답변을 처리하는 데 실패했습니다.**\n\nAI 모델 응답 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
            String errorJsonResponse = String.format("{\"content\":\"%s\", \"schedule\":[]}", errorMessage);
            AiMessage aiMessage = saveAiMessage(conversation, errorJsonResponse);
            return new MessageResponseDto(aiMessage.getId(), errorMessage, "ai", LocalDateTime.now(), Collections.emptyList(), conversation.getChatroomId());
        }
    }

    private String generateFinalPlanFromData(List<Map<String, String>> messages) {
        String systemPrompt = """
        당신은 사용자의 요청을 기반으로, 상세하고 실용적인 여행 계획을 만드는 최고의 여행 전문가 '플래닛' 입니다.
        당신의 임무는 사용자가 "이대로만 가면 되겠다!"라고 느낄 만큼 완벽한 여행 계획을 JSON 형식으로 작성하는 것입니다.
        당신은 당신의 방대한 지식을 활용하여, 반드시 실존하는 장소의 이름, 주소, 좌표를 찾아내야 합니다.
        """;

        String assistantInstruction = """
        사용자의 요청을 분석하여, 아래 규칙에 따라 여행 계획을 생성하겠습니다.

        ## 콘텐츠 생성 규칙
        1. **상세한 일일 구조**: 각 날짜별로 **'오전', '점심', '오후', '저녁'** 순서에 맞춰 구체적인 활동과 장소를 추천합니다. 하루에 최소 3개 이상의 구체적인 장소를 추천하여 일정이 비어 보이지 않게 합니다.
        2. **정확한 상호명 명시**: '맛집 탐방', '쇼핑'과 같은 추상적인 활동 대신, **"쌍둥이돼지국밥", "신세계백화점 센텀시티점"**처럼 실제 상호명을 반드시 명시합니다.
        3. **매력적인 설명**: 각 장소를 추천할 때는, 왜 그곳을 방문해야 하는지에 대한 흥미로운 이유를 1~2 문장으로 덧붙입니다.
        4. **마크다운 활용**: `content` 필드는 사용자가 읽기 쉽도록 제목(###), 목록(-), 굵은 글씨(**) 등 마크다운을 적극적으로 활용하여 아름답게 구성합니다.
        5. **추가 추천 섹션**: 모든 일정이 끝난 후, `content` 필드 마지막에 **'추가 추천 맛집'**과 **'인기 숙소 리스트'** 섹션을 반드시 포함하여 더 많은 선택지를 제공합니다.

        ## 출력 형식 규칙 (절대 엄수)
        - 당신의 모든 응답은 다른 설명 없이, 반드시 아래 형식의 완벽한 JSON이어야 합니다.
        - `schedule` 배열의 각 객체에는 **`day` 필드가 1부터 시작하는 숫자**로 반드시 포함되어야 합니다.
        - 모든 `places` 객체에는 **`title`, `address`, `description`, `category`, `mapx`, `mapy`** 필드가 반드시 포함되어야 합니다.
        
        {
          "content": "(마크다운으로 작성된 전체 여행 계획 설명. 예: ### 1일차: 해운대 완전 정복!\\n- 오전: **해운대 해수욕장** 방문하여 산책...)",
          "schedule": [
            {
              "day": 1,
              "places": [
                { "title": "해운대 해수욕장", "address": "부산 해운대구 우동", "description": "넓은 백사장과 아름다운 바다 풍경을 자랑하는 부산의 대표적인 해수욕장입니다.", "category": "관광지", "mapx": 129.1586, "mapy": 35.1587 },
                { "title": "해운대 소문난 암소갈비집", "address": "부산 해운대구 중동2로10번길 32-10", "description": "부드러운 암소갈비가 일품인, 60년 전통의 부산 대표 갈비 맛집입니다.", "category": "맛집", "mapx": 129.1619, "mapy": 35.1634 }
              ]
            }
          ]
        }
        """;

        Map<String, String> systemMessage = Map.of("role", "system", "content", systemPrompt);
        Map<String, String> assistantMessage = Map.of("role", "assistant", "content", assistantInstruction);

        List<Map<String, String>> finalMessages = new ArrayList<>();
        finalMessages.add(systemMessage);
        finalMessages.addAll(messages);
        finalMessages.add(assistantMessage);

        return callLlm(finalMessages);
    }

    private String callLlm(List<Map<String, String>> finalMessages) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-4-turbo");
        requestBody.put("messages", finalMessages);
        requestBody.put("response_format", Map.of("type", "json_object"));
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            String response = restTemplate.postForObject(OPENAI_CHAT_URL, entity, String.class);
            JsonNode choices = objectMapper.readTree(response).path("choices");
            if (choices.isArray() && choices.size() > 0) {
                return choices.get(0).path("message").path("content").asText();
            }
            throw new Exception("AI 응답에서 choices를 찾을 수 없습니다.");
        } catch (Exception e) {
            log.error("OpenAI API 호출 실패! (잔액 또는 네트워크 확인 필요)", e);
            String errorMessage = "**AI API 호출 중 오류가 발생했습니다.**\\n\\n(OpenAI API 할당량 초과 또는 네트워크 문제)\\n잠시 후 다시 시도해주세요.";
            return String.format("{\"content\":\"%s\", \"schedule\":[]}", errorMessage);
        }
    }

    private AiConversation findOrCreateConversation(Long chatroomId, String userQuery, User currentUser) {
        if (chatroomId != null) {
            return conversationRepository.findById(chatroomId).orElseThrow(() -> new RuntimeException("대화방을 찾을 수 없습니다."));
        }
        String title = userQuery.length() > 20 ? userQuery.substring(0, 20) + "..." : userQuery;
        AiConversation conversation = AiConversation.builder().user(currentUser).title(title).build();
        return conversationRepository.save(conversation);
    }

    private void saveUserMessage(AiConversation conversation, String content) {
        messageRepository.save(AiMessage.builder().conversation(conversation).content(content).actor("user").datetime(LocalDateTime.now()).build());
    }

    private AiMessage saveAiMessage(AiConversation conversation, String content) {
        return messageRepository.save(AiMessage.builder().conversation(conversation).content(content).actor("ai").datetime(LocalDateTime.now()).build());
    }

    private String extractContentFromJson(String jsonContent) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonContent);
            // AI의 응답 JSON에서 content 필드만 히스토리에 포함, 사용자 메시지는 그대로 사용
            if (rootNode.has("content")) {
                return rootNode.path("content").asText("");
            }
            return jsonContent;
        } catch (Exception e) {
            // JSON 파싱 실패 시 원본 텍스트 반환 (사용자 메시지 등)
            return jsonContent;
        }
    }
}