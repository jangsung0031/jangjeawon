package kr.co.pib.repository;

import kr.co.pib.entity.MyTourCourse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MyTourCourseRepository extends JpaRepository<MyTourCourse, Long> {
    List<MyTourCourse> findByUserId(Long userId);

    boolean existsByUserIdAndContentId(Long userId, String contentId);

    Optional<MyTourCourse> findByIdAndUserId(Long id, Long userId); // 삭제용
}
