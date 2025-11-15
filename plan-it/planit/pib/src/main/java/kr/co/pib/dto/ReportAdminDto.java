// kr/co/pib/dto/ReportAdminDto.java
package kr.co.pib.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ReportAdminDto {
    private Long id;

    private Long courseId;
    private String courseTitle;      // ✅ 코스 이름

    private Long commentId;
    private String commentContent;

    private boolean hidden;          // ✅ 숨김 여부 (프론트에서 버튼/표시 제어)

    private Long reporterId;
    private String reporterNickname;

    private String reason;
    private LocalDateTime createdAt;
}
