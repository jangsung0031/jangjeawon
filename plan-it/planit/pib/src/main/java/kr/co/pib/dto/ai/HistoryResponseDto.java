package kr.co.pib.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;


@Data
@AllArgsConstructor
public class HistoryResponseDto {

//     팅방 고유 ID
    private Long chatroomId;


//     채팅방의 제목 (보통 첫 질문)
    private String title;


//     채팅방 생성 일자
    private LocalDateTime createdAt;
}