package kr.co.pib.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kr.co.pib.dto.ai.HistoryResponseDto;
import kr.co.pib.dto.ai.MessageResponseDto;
import kr.co.pib.dto.ai.ScheduleDayDto;
import kr.co.pib.entity.AiConversation;
import kr.co.pib.entity.AiMessage;
import kr.co.pib.entity.User;
import kr.co.pib.repository.AiConversationRepository;
import kr.co.pib.repository.AiMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException; // AccessDeniedException import
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiChatService {

    private final AiConversationRepository conversationRepo;
    private final AiMessageRepository messageRepo;
    private final ObjectMapper objectMapper; // JSON 파싱을 위해 주입

    public List<HistoryResponseDto> getHistory(User user) {
        return conversationRepo.findByUserOrderByCreatedAtDesc(user).stream()
                .map(conv -> new HistoryResponseDto(conv.getChatroomId(), conv.getTitle(), conv.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<MessageResponseDto> getMessages(Long chatroomId, User user) {
        AiConversation conversation = conversationRepo.findById(chatroomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다. ID: " + chatroomId));

        // ✨ 접근 권한 확인: SecurityException 대신 AccessDeniedException 사용
        if (!conversation.getUser().getUid().equals(user.getUid())) {
            throw new AccessDeniedException("해당 채팅방에 접근할 권한이 없습니다.");
        }

        return messageRepo.findByConversationOrderByDatetimeAsc(conversation).stream()
                .map(this::convertMessageToDto) // DTO 변환 로직을 별도 메소드로 분리
                .collect(Collectors.toList());
    }

    private MessageResponseDto convertMessageToDto(AiMessage msg) {
        // 사용자가 보낸 메시지는 schedule 데이터가 없으므로 간단히 변환합니다.
        if ("user".equals(msg.getActor())) {
            return new MessageResponseDto(msg.getId(), msg.getContent(), msg.getActor(), msg.getDatetime(), Collections.emptyList(), msg.getConversation().getChatroomId());
        }

        // AI가 보낸 메시지는 content가 JSON 형식이므로 파싱이 필요합니다.
        try {
            JsonNode rootNode = objectMapper.readTree(msg.getContent());
            String markdownContent = rootNode.path("content").asText(msg.getContent()); // 파싱 실패 시 원본 텍스트 사용
            List<ScheduleDayDto> schedule = objectMapper.convertValue(
                    rootNode.path("schedule"),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, ScheduleDayDto.class)
            );
            return new MessageResponseDto(msg.getId(), markdownContent, msg.getActor(), msg.getDatetime(), schedule, msg.getConversation().getChatroomId());
        } catch (Exception e) {
            // 만약 content가 JSON 형식이 아닌 일반 텍스트일 경우(오류 메시지 등)
            log.warn("AI 메시지 content 파싱 실패 (메시지 ID: {}). 일반 텍스트로 처리합니다.", msg.getId());
            return new MessageResponseDto(msg.getId(), msg.getContent(), msg.getActor(), msg.getDatetime(), Collections.emptyList(), msg.getConversation().getChatroomId());
        }
    }
}