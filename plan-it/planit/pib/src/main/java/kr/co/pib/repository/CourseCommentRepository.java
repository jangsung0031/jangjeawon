// kr/co/pib/repository/CourseCommentRepository.java
package kr.co.pib.repository;

import kr.co.pib.entity.CourseComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseCommentRepository extends JpaRepository<CourseComment, Long> {

    // ====== 기존 ======
    Page<CourseComment> findByCourseIdOrderByIdDesc(Long courseId, Pageable pageable);

    interface CommentAgg {
        Long getCourseId();
        Long getCnt();
    }

    @Query("""
           select c.courseId as courseId,
                  count(c)   as cnt
           from CourseComment c
           where c.courseId in :ids
           group by c.courseId
           """)
    List<CommentAgg> findAggByCourseIds(@Param("ids") List<Long> ids);

    @Query(value = "select CAST(user_id AS SIGNED) from course_comment where id = :id", nativeQuery = true)
    Optional<Long> findAuthorUidById(@Param("id") Long id);

    // ✅ 숨김 처리(소프트 삭제)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update CourseComment c set c.hidden = true where c.id = :id")
    int markHidden(@Param("id") Long id);


    // ====== 추가: 회원탈퇴/코스삭제용 유틸 ======

    /** 특정 사용자가 쓴 댓글 PK 목록 */
    @Query("select c.id from CourseComment c where c.userId = :uid")
    List<Long> findIdsByUserUid(@Param("uid") Long uid);

    /** 특정 사용자가 쓴 댓글 일괄 삭제 */
    @Modifying
    @Query("delete from CourseComment c where c.userId = :uid")
    void deleteByUserUid(@Param("uid") Long uid);

    /** 여러 코스에 달린 댓글 PK 목록 */
    @Query("select c.id from CourseComment c where c.courseId in :courseIds")
    List<Long> findIdsByCourseIdIn(@Param("courseIds") List<Long> courseIds);

    /** 여러 코스에 달린 댓글 일괄 삭제 */
    @Modifying
    @Query("delete from CourseComment c where c.courseId in :courseIds")
    void deleteByCourseIdIn(@Param("courseIds") List<Long> courseIds);

    /** 단일 코스에 달린 댓글 전부 삭제(옵션) */
    @Modifying
    @Query("delete from CourseComment c where c.courseId = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);
}
