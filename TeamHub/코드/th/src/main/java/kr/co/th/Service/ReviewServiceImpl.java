package kr.co.th.Service;

import kr.co.th.Repository.ReviewRepository;
import kr.co.th.Repository.UserRepository;
import kr.co.th.vo.Review;
import kr.co.th.vo.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Pageable;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Value("${custom.upload-path}")
    private String uploadPath;

    @Override
    public ResponseEntity<?> createReview(MultipartFile imageFile, String content, int rating, Long userId) {
        try {
            User user = userRepository.findById(userId).orElseThrow();

            String originalName = imageFile.getOriginalFilename();
            String uuid = UUID.randomUUID().toString();
            String imageName = uuid + "_" + originalName;

            File saveFile = new File(uploadPath, imageName);
            imageFile.transferTo(saveFile);

            Review review = Review.builder()
                    .user(user)
                    .content(content)
                    .rating(rating)
                    .imageName(imageName)
                    .build();

            Review saved = reviewRepository.save(review);
            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("파일 저장 중 오류 발생");
        }
    }

    @Override
    public Review writeReview(User user, Review review) {
        review.setUser(user);
        return reviewRepository.save(review);
    }

    @Override
    public List<Review> getReviews(String category, Long targetId) {
        return reviewRepository.findByCategoryAndTargetId(category, targetId);
    }

    @Override
    public List<Review> getReviewsByCategory(String category) {
        return reviewRepository.findByCategoryWithTargetIdNotNull(category);
    }

    @Override
    public List<Review> getAllReviews() {
        return reviewRepository.findByTargetIdIsNotNull();
    }

    @Override
    public List<Review> getMyReviews(User user) {
        return reviewRepository.findByUser(user);
    }

    @Override
    public Review updateReview(User user, Long reviewId, Review updatedReview) {
        Review existing = reviewRepository.findById(reviewId)
                .filter(r -> r.getUser().equals(user))
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없거나 권한이 없습니다."));

        existing.setRating(updatedReview.getRating());
        existing.setContent(updatedReview.getContent());

        if (updatedReview.getImageName() != null) {
            existing.setImageName(updatedReview.getImageName());
        }

        return reviewRepository.save(existing);
    }

    @Override
    public void deleteReview(User user, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .filter(r -> r.getUser().equals(user))
                .orElseThrow(() -> new RuntimeException("삭제 권한이 없습니다."));
        reviewRepository.delete(review);
    }

    @Override
    public void replyToReview(Long id, String reply) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));
        review.setReply(reply);
        reviewRepository.save(review);
    }

    @Override
    public void deleteReviewByAdmin(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));
        reviewRepository.delete(review);
    }

    @Override
    public List<Review> getAllReviewsForAdmin() {
        return reviewRepository.findAll();
    }

    public List<Review> getReviewsByCategoryAndTarget(String category, Long targetId) {
        return reviewRepository.findByCategoryAndTargetId(category, targetId);
    }

    @Override
    public Page<Review> getAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable);
    }

    @Override
    public Page<Review> getReviews(String category, Long targetId, Pageable pageable) {
        return reviewRepository.findByCategoryAndTargetId(category, targetId, pageable);
    }

    @Override
    public Page<Review> getReviewsByCategory(String category, Pageable pageable) {
        return reviewRepository.findByCategory(category, pageable);
    }

    @Override
    public Page<Review> getMyReviewsPaged(User user, Pageable pageable) {
        return reviewRepository.findByUser(user, pageable);
    }

    @Override
    public Page<Review> getPagedReviewsForAdmin(int page, int size, String category, Long targetId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        if ((category == null || category.equals("all")) && targetId == null) {
            return getAllReviews(pageable);
        } else if ((category == null || category.equals("all"))) {
            return reviewRepository.findByTargetId(targetId, pageable);
        } else if (targetId == null) {
            return getReviewsByCategory(category, pageable);
        } else {
            return getReviews(category, targetId, pageable);
        }
    }

}

