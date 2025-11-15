package kr.co.th.Controller;

import kr.co.th.Service.ReviewService;
import kr.co.th.dto.ReviewDTO;
import kr.co.th.vo.Review;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<ReviewDTO>> getAllReviews() {
        List<Review> reviews = reviewService.getAllReviewsForAdmin();
        List<ReviewDTO> dtoList = reviews.stream()
                .map(ReviewDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<?> replyToReview(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reply = body.get("reply");
        reviewService.replyToReview(id, reply);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/paged")
    public ResponseEntity<?> getPagedReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long targetId) {

        Page<Review> result = reviewService.getPagedReviewsForAdmin(page, size, category, targetId);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        reviewService.deleteReviewByAdmin(id);
        return ResponseEntity.ok("리뷰가 삭제되었습니다.");
    }
}