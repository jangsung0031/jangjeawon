package kr.co.pib.dto.ai;

import lombok.AllArgsConstructor;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponseDto {

    /** 메시지 ID */
    private Long messageId;

    /** AI가 생성한 마크다운 형식의 채팅 응답 내용 */
    private String content;

    /** 메시지 발신자 ("user" 또는 "ai") */
    private String actor;

    /** 메시지 생성 시간 */
    private LocalDateTime datetime;

    /** * 일차별로 그룹화된 여행 계획 전체.*/
    private List<ScheduleDayDto> schedule;

    /** 현재 채팅방 ID */
    private Long chatroomId;
}