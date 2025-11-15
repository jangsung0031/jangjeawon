// kr/co/pib/dto/CommentDto.java
package kr.co.pib.dto;

import kr.co.pib.entity.CourseComment;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class CommentDto {
    private Long id;
    private String authorNickname;
    private String content;
    private LocalDateTime createdAt;
    private boolean hidden;

    public static CommentDto from(CourseComment c) {
        // ✅ 숨김이면 문구로 치환
        String visible = c.isHidden() ? "신고로 인해 숨겨진 댓글입니다." : c.getContent();

        return new CommentDto(
                c.getId(),
                c.getAuthorNickname(),
                visible,          // ← 여기!
                c.getCreatedAt(),
                c.isHidden()
        );
    }
}


