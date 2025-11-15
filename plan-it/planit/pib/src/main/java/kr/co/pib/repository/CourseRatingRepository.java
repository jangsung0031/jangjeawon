package kr.co.pib.repository;

import kr.co.pib.entity.CourseRating;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRatingRepository extends JpaRepository<CourseRating, Long> {

    Optional<CourseRating> findByCourseIdAndUserId(Long courseId, Long userId);

    @Query("select coalesce(avg(r.score),0) from CourseRating r where r.courseId = :courseId")
    Double findAvgByCourseId(@Param("courseId") Long courseId);

    @Query("select count(r) from CourseRating r where r.courseId = :courseId")
    Long countByCourseId(@Param("courseId") Long courseId);

    // ✅ 리스트 화면 집계용 프로젝션/쿼리
    interface RatingAgg {
        Long getCourseId();
        Double getAvg();
        Long getCnt();
    }

    @Query("""
           select r.courseId as courseId,
                  avg(r.score) as avg,
                  count(r)     as cnt
           from CourseRating r
           where r.courseId in :ids
           group by r.courseId
           """)
    List<RatingAgg> findAggByCourseIds(@Param("ids") List<Long> ids);

    /* ===================== 추가: 삭제용 ===================== */

    // 사용자가 남긴 모든 별점 삭제 (회원탈퇴용)
    @Modifying
    @Query("delete from CourseRating r where r.userId = :uid")
    void deleteByUserUid(@Param("uid") Long uid);

    // 여러 코스에 달린 별점 일괄 삭제 (내가 만든 코스들 정리용)
    @Modifying
    @Query("delete from CourseRating r where r.courseId in :courseIds")
    void deleteByCourseIdIn(@Param("courseIds") List<Long> courseIds);

    // 단일 코스의 별점 전부 삭제 (옵션)
    @Modifying
    @Query("delete from CourseRating r where r.courseId = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);
}
