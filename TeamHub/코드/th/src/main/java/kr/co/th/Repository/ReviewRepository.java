package kr.co.th.Repository;

import kr.co.th.vo.Review;
import kr.co.th.vo.User;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByUser(User user);

    List<Review> findByCategory(String category);

    List<Review> findByCategoryAndTargetId(String category, Long targetId);

    List<Review> findByTargetIdIsNotNull();

    @Query("SELECT r FROM Review r WHERE r.category = :category AND r.targetId IS NOT NULL")
    List<Review> findByCategoryWithTargetIdNotNull(@Param("category") String category);

    Page<Review> findByCategory(String category, Pageable pageable);

    Page<Review> findByCategoryAndTargetId(String category, Long targetId, Pageable pageable);

    Page<Review> findAll(Pageable pageable);

    Page<Review> findByUser(User user, Pageable pageable);

    Page<Review> findByTargetId(Long targetId, Pageable pageable);


}