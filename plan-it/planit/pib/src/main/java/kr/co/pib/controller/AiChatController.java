package kr.co.pib.controller;

import kr.co.pib.dto.ai.AskRequestDto;
import kr.co.pib.dto.ai.HistoryResponseDto;
import kr.co.pib.dto.ai.MessageResponseDto;
import kr.co.pib.entity.User;
import kr.co.pib.repository.UserRepository; // UserRepository를 사용하기 위해 import
import kr.co.pib.service.ai.AiChatService;
import kr.co.pib.service.ai.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;
    private final AiService aiService;
    private final UserRepository userRepository;

    @GetMapping("/history")
    public ResponseEntity<List<HistoryResponseDto>> getChatHistory(@AuthenticationPrincipal String userId) {
        // 1. @AuthenticationPrincipal로 String 타입의 userId를 직접 받습니다.
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // 2. DB에서 찾은 User 객체로 서비스에 요청합니다.
        return ResponseEntity.ok(aiChatService.getHistory(currentUser));
    }

    @GetMapping("/messages/{chatroomId}")
    public ResponseEntity<List<MessageResponseDto>> getChatMessages(
            @PathVariable Long chatroomId,
            @AuthenticationPrincipal String userId) {

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        return ResponseEntity.ok(aiChatService.getMessages(chatroomId, currentUser));
    }

    @PostMapping("/ask-ai")
    public ResponseEntity<MessageResponseDto> askAi(
            @RequestBody AskRequestDto requestDto,
            @AuthenticationPrincipal String userId) {

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        try {
            MessageResponseDto response = aiService.getResponse(requestDto, currentUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}