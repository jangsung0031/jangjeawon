package kr.co.th.dto;

import kr.co.th.vo.Review;
import kr.co.th.vo.User;
import lombok.*;

import java.time.format.DateTimeFormatter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {

    private Long id;

    private String username;
    private String email;

    private String category;
    private Long targetId;

    private int rating;
    private String content;
    private String imageName;
    private String createdAt;

    private String reply;
    private boolean reported;

    public static ReviewDTO fromEntity(Review review) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return ReviewDTO.builder()
                .id(review.getId())
                .username(review.getUser().getUsername())
                .category(review.getCategory())
                .targetId(review.getTargetId())
                .rating(review.getRating())
                .content(review.getContent())
                .imageName(review.getImageName())
                .createdAt(review.getCreatedAt().format(formatter))
                .reply(review.getReply())
                .reported(review.isReported())
                .build();
    }
}
