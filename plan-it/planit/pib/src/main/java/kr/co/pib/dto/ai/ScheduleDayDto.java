package kr.co.pib.dto.ai;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ScheduleDayDto {

    private int day;

    private List<PlaceDto> places;
}