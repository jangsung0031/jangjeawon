package kr.co.th.Service;

import kr.co.th.Repository.UserRepository;
import kr.co.th.vo.Review;
import kr.co.th.vo.User;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReviewService {

    ResponseEntity<?> createReview(MultipartFile imageFile, String content, int rating, Long userId);

    Review writeReview(User user, Review review);

    List<Review> getReviews(String category, Long targetId);

    List<Review> getReviewsByCategory(String category);

    List<Review> getMyReviews(User user);

    Review updateReview(User user, Long reviewId, Review updatedReview);

    void deleteReview(User user, Long reviewId);

    List<Review> getAllReviews();

    void replyToReview(Long id, String reply);
    void deleteReviewByAdmin(Long reviewId);
    List<Review> getAllReviewsForAdmin();

    Page<Review> getAllReviews(Pageable pageable);

    Page<Review> getReviews(String category, Long targetId, Pageable pageable);

    Page<Review> getReviewsByCategory(String category, Pageable pageable);

    Page<Review> getMyReviewsPaged(User user, Pageable pageable);

    Page<Review> getPagedReviewsForAdmin(int page, int size, String category, Long targetId);

}