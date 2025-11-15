package kr.co.pib.dto.ai;

import lombok.Data;

@Data
public class AskRequestDto {
    /** 사용자의 질문 (예: "부산 2박3일 여행 추천해줘") */
    private String question;

    /** 이전 대화에 이어서 질문할 경우 필요한 채팅방 ID */
    private Long chatroomId;
}