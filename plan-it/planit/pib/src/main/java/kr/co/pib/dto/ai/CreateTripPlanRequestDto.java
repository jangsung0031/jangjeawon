package kr.co.pib.dto.ai;

import kr.co.pib.dto.ai.ScheduleDayDto;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class CreateTripPlanRequestDto {

    /**
     * 저장할 계획의 제목입니다.
     * 사용자가 직접 입력하거나 AI가 생성한 첫 질문 등으로 설정될 수 있습니다.
     */
    private String title;

    /**
     * AI와의 대화를 통해 최종적으로 확정된 일차별 계획 데이터입니다.
     * 이 데이터는 '내 여행 계획'으로 저장되어, 추후 '게시판 공유' 기능 등에 사용될 수 있습니다.
     */
    private List<ScheduleDayDto> schedule;
}
