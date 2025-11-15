// src/main/java/kr/co/pib/repository/CommentReportRepository.java
package kr.co.pib.repository;

import kr.co.pib.entity.CommentReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentReportRepository extends JpaRepository<CommentReport, Long> {

    // ===== 기존 =====
    Page<CommentReport> findAllByOrderByIdDesc(Pageable pageable);
    long countByCommentId(Long commentId);
    boolean existsByCommentIdAndReporterId(Long commentId, Long reporterId);

    // ===== 추가: 일괄 삭제용 =====

    /** 특정 사용자가 신고한 모든 기록 삭제 (회원 탈퇴 시) */
    @Modifying
    @Query("delete from CommentReport cr where cr.reporterId = :uid")
    void deleteByReporterId(@Param("uid") Long uid);

    /** 댓글 ID 목록으로 신고 기록 일괄 삭제 (댓글/코스 삭제 전에 선정리) */
    @Modifying
    @Query("delete from CommentReport cr where cr.commentId in :commentIds")
    void deleteByCommentIdIn(@Param("commentIds") List<Long> commentIds);

    /** 단일 댓글 신고 기록 모두 삭제 (옵션) */
    @Modifying
    @Query("delete from CommentReport cr where cr.commentId = :commentId")
    void deleteByCommentId(@Param("commentId") Long commentId);
}
