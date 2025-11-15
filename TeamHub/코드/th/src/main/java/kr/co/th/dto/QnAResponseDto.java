package kr.co.th.dto;


import kr.co.th.vo.QnA;
import lombok.*;

import java.time.format.DateTimeFormatter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QnAResponseDto {

    private Long id;
    private String category;
    private String title;
    private String content;
    private String answer;
    private String username;
    private String createdAt;
    private String answeredAt;
    private QnA.QnAStatus status;
    private Boolean isPrivate;

    public static QnAResponseDto fromEntity(QnA qna) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        return QnAResponseDto.builder()
                .id(qna.getId())
                .category(qna.getCategory())
                .title(qna.getTitle())
                .content(qna.getContent())
                .answer(qna.getAnswer())
                .username(qna.getUsername())
                .createdAt(qna.getCreatedAt() != null ? qna.getCreatedAt().format(formatter) : null)
                .answeredAt(qna.getAnsweredAt() != null ? qna.getAnsweredAt().format(formatter) : null)
                .status(qna.getStatus())
                .isPrivate(qna.getIsPrivate())
                .build();
    }
}