package kr.co.pib.service;

import kr.co.pib.dto.ReportRequest;
import kr.co.pib.entity.CommentReport;
import kr.co.pib.repository.CommentReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentReportService {

    private final CommentReportRepository reportRepository;
    private final CourseCommentReader courseCommentReader;

    /**
     * 댓글 작성자 본인 신고 방지,
     * 중복 신고 방지,
     * 신고 후 누적 신고 수 반환
     */
    @Transactional
    public long report(Long courseId, Long commentId, Long reporterId, String reporterNickname, ReportRequest req) {
        // 1) 댓글 작성자 본인인지 확인 (작성자 UID 조회)
        Long authorUid = courseCommentReader.findAuthorUidByCommentId(commentId);
        if (authorUid != null && authorUid.equals(reporterId)) {
            throw new IllegalArgumentException("본인 댓글은 신고할 수 없습니다.");
        }

        // 2) 중복 신고 방지
        if (reportRepository.existsByCommentIdAndReporterId(commentId, reporterId)) {
            // 이미 신고한 경우 -> 누적 수만 반환
            return reportRepository.countByCommentId(commentId);
        }

        // 3) 저장
        CommentReport report = CommentReport.builder()
                .commentId(commentId)
                .courseId(courseId)
                .reporterId(reporterId)
                .reporterNickname(reporterNickname)
                .reason(req != null ? req.getReason() : null)
                .build();

        reportRepository.save(report);

        // 4) 누적 수 반환
        return reportRepository.countByCommentId(commentId);
    }

    // 댓글 작성자 UID만 안전하게 얻어오기 위한 내부용 리더
    @RequiredArgsConstructor
    @Service
    public static class CourseCommentReader {
        private final kr.co.pib.repository.CourseCommentRepository courseCommentRepository;

        public Long findAuthorUidByCommentId(Long commentId) {
            // ✅ 리포지토리 메서드명과 일치 (user_id 사용)
            return courseCommentRepository.findAuthorUidById(commentId).orElse(null);
        }
    }
}
