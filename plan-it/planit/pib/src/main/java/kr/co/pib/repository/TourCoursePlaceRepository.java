package kr.co.pib.repository;

import kr.co.pib.entity.TourCourse;
import kr.co.pib.entity.TourCoursePlace;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TourCoursePlaceRepository extends JpaRepository<TourCoursePlace, Long> {

    List<TourCoursePlace> findByCourseId(Long courseId);

    Optional<TourCoursePlace> findFirstByCourseIdOrderByDayAscIdAsc(Long courseId);

    // ✅ 코스별 최대 day 값 조회 (총 일수 계산용)
    @Query("SELECT MAX(p.day) FROM TourCoursePlace p WHERE p.course.id = :courseId")
    Integer findMaxDayByCourseId(@Param("courseId") Long courseId);

    // 단일 코스 엔티티로 삭제 (트랜잭션 내에서 사용)
    void deleteByCourse(TourCourse course);

    // ✅ 단일 코스 ID로 삭제 (벌크)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM TourCoursePlace p WHERE p.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);

    // ✅ 여러 코스 ID로 한 번에 삭제 (회원 탈퇴 시 핵심)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM TourCoursePlace p WHERE p.course.id IN :courseIds")
    void deleteByCourseIds(@Param("courseIds") Collection<Long> courseIds);
}
