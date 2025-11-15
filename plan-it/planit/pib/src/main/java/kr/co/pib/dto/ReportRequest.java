package kr.co.pib.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ReportRequest {
    private String reason; // 신고 사유(선택)
    private String token;  // ✅ 바디로 전달되는 백업 토큰
}

