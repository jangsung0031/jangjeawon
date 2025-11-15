package kr.co.th.Controller;

import jakarta.servlet.http.HttpServletRequest;
import kr.co.th.dto.ReviewDTO;
import kr.co.th.Repository.UserRepository;
import kr.co.th.Service.ReviewServiceImpl;
import kr.co.th.util.JwtUtil;
import kr.co.th.vo.Review;
import kr.co.th.vo.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewServiceImpl reviewService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> createReview(
            HttpServletRequest request,
            @RequestPart("review") ReviewDTO dto,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        String token = extractToken(request);
        String userid = jwtUtil.validateAndGetSubject(token);
        User user = userRepository.findByUserid(userid).orElseThrow();

        String filename = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String uploadDir = "C:/thImg/";
                String originalName = imageFile.getOriginalFilename();
                String uuid = UUID.randomUUID().toString();
                filename = uuid + "_" + originalName;
                imageFile.transferTo(new File(uploadDir + filename));
            } catch (IOException e) {
                return ResponseEntity.badRequest().body("이미지 업로드 실패");
            }
        }

        Review review = Review.builder()
                .user(user)
                .category(dto.getCategory())
                .targetId(dto.getTargetId())
                .rating(dto.getRating())
                .content(dto.getContent())
                .imageName(filename)
                .build();

        Review saved = reviewService.writeReview(user, review);
        return ResponseEntity.ok(ReviewDTO.fromEntity(saved));
    }

    @GetMapping
    public ResponseEntity<List<ReviewDTO>> getReviews(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long targetId) {

        List<Review> reviews;

        if (category != null && targetId != null) {
            reviews = reviewService.getReviewsByCategoryAndTarget(category, targetId);
        } else if (category != null) {
            reviews = reviewService.getReviewsByCategory(category);
        } else {
            reviews = reviewService.getAllReviews();
        }

        List<ReviewDTO> result = reviews.stream()
                .map(ReviewDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReviewDTO>> getMyReviews(HttpServletRequest request) {
        String token = extractToken(request);
        String userid = jwtUtil.validateAndGetSubject(token);
        User user = userRepository.findByUserid(userid).orElseThrow();

        List<Review> reviews = reviewService.getMyReviews(user);
        List<ReviewDTO> result = reviews.stream()
                .map(ReviewDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/write")
    public ResponseEntity<ReviewDTO> writeReview(HttpServletRequest request,
                                                 @RequestPart("review") ReviewDTO dto,
                                                 @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        String token = extractToken(request);
        String userid = jwtUtil.validateAndGetSubject(token);
        User user = userRepository.findByUserid(userid).orElseThrow();

        String filename = dto.getImageName();

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String uploadDir = "C:/thImg/";
                String originalName = imageFile.getOriginalFilename();
                String uuid = UUID.randomUUID().toString();
                filename = uuid + "_" + originalName;
                imageFile.transferTo(new File(uploadDir + filename));
            } catch (IOException e) {
                return ResponseEntity.badRequest().body(null);
            }
        }

        Review review = Review.builder()
                .user(user)
                .category(dto.getCategory())
                .targetId(dto.getTargetId())
                .rating(dto.getRating())
                .content(dto.getContent())
                .imageName(filename)
                .build();

        Review saved = reviewService.writeReview(user, review);
        return ResponseEntity.ok(ReviewDTO.fromEntity(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewDTO> updateReview(HttpServletRequest request,
                                                  @PathVariable Long id,
                                                  @RequestPart("review") ReviewDTO dto,
                                                  @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        String token = extractToken(request);
        String userid = jwtUtil.validateAndGetSubject(token);
        User user = userRepository.findByUserid(userid).orElseThrow();

        String filename = dto.getImageName();

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String uploadDir = "C:/thImg/";
                String originalName = imageFile.getOriginalFilename();
                String uuid = UUID.randomUUID().toString();
                filename = uuid + "_" + originalName;
                imageFile.transferTo(new File(uploadDir + filename));
            } catch (IOException e) {
                return ResponseEntity.badRequest().body(null);
            }
        }

        Review updated = Review.builder()
                .rating(dto.getRating())
                .content(dto.getContent())
                .imageName(filename)
                .build();

        Review saved = reviewService.updateReview(user, id, updated);
        return ResponseEntity.ok(ReviewDTO.fromEntity(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteReview(HttpServletRequest request,
                                               @PathVariable Long id) {
        String token = extractToken(request);
        String userid = jwtUtil.validateAndGetSubject(token);
        User user = userRepository.findByUserid(userid).orElseThrow();

        reviewService.deleteReview(user, id);
        return ResponseEntity.ok("리뷰가 삭제되었습니다.");
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<ReviewDTO>> getReviews(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long targetId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<Review> page;

        if (category != null && targetId != null) {
            page = reviewService.getReviews(category, targetId, pageable);
        } else if (category != null) {
            page = reviewService.getReviewsByCategory(category, pageable);
        } else {
            page = reviewService.getAllReviews(pageable);
        }

        Page<ReviewDTO> result = page.map(ReviewDTO::fromEntity);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/my/paged")
    public ResponseEntity<Page<ReviewDTO>> getMyReviewsPaged(
            HttpServletRequest request,
            @PageableDefault(size = 6, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        String token = extractToken(request);
        String userid = jwtUtil.validateAndGetSubject(token);
        User user = userRepository.findByUserid(userid).orElseThrow();

        Page<Review> page = reviewService.getMyReviewsPaged(user, pageable);
        Page<ReviewDTO> result = page.map(ReviewDTO::fromEntity);
        return ResponseEntity.ok(result);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        return header != null ? header.replace("Bearer ", "") : "";
    }
}