package kr.co.pib.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponse {
        private Long commentId;
        private Long courseId;
        private long reportCount;
        private String message;
}
