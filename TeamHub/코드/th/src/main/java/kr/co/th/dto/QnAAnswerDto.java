package kr.co.th.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QnAAnswerDto {
    private Long id;
    private String answer;
}
