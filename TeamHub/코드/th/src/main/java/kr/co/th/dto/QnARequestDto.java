package kr.co.th.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QnARequestDto {
    private String category;
    private String title;
    private String content;
    private String username;
    private Boolean isPrivate;
}
