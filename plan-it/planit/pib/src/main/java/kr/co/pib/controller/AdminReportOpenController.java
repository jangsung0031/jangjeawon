// kr/co/pib/controller/AdminReportOpenController.java
package kr.co.pib.controller;

import jakarta.transaction.Transactional;
import kr.co.pib.dto.ReportAdminDto;
import kr.co.pib.entity.CommentReport;
import kr.co.pib.entity.CourseComment;
import kr.co.pib.repository.CommentReportRepository;
import kr.co.pib.repository.CourseCommentRepository;
import kr.co.pib.repository.TourCourseRepository; // 코스 제목 조회용
import kr.co.pib.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/course/admin")
@CrossOrigin(origins = "http://localhost")
public class AdminReportOpenController {

    private final JwtUtil jwtUtil;
    private final CommentReportRepository reportRepository;
    private final CourseCommentRepository courseCommentRepository;
    private final TourCourseRepository tourCourseRepository;

    /* === 신고 목록 (ADMIN만) === */
    @GetMapping("/reports")
    public ResponseEntity<?> list(
            @RequestHeader HttpHeaders headers,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(value = "token", required = false) String tokenFromQuery
    ) {
        String token = pickToken(headers, tokenFromQuery);
        if (isBlank(token)) return ResponseEntity.status(401).body(Map.of("message", "UNAUTHORIZED_NO_TOKEN"));
        if (!isAdmin(token)) return ResponseEntity.status(403).body(Map.of("message", "FORBIDDEN"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<CommentReport> data = reportRepository.findAllByOrderByIdDesc(pageable);

        Page<ReportAdminDto> dto = data.map(rep -> {
            String courseTitle = tourCourseRepository
                    .findTitleById(rep.getCourseId())
                    .orElse("(제목 없음)");

            String commentContent = "(삭제됨)";
            boolean hidden = false;
            if (rep.getCommentId() != null) {
                CourseComment cc = courseCommentRepository.findById(rep.getCommentId()).orElse(null);
                if (cc != null) {
                    commentContent = cc.getContent();
                    hidden = cc.isHidden();  // ✅ 숨김 여부
                }
            }

            return ReportAdminDto.builder()
                    .id(rep.getId())
                    .courseId(rep.getCourseId())
                    .courseTitle(courseTitle)
                    .commentId(rep.getCommentId())
                    .commentContent(commentContent)
                    .hidden(hidden) // ✅ 관리자 페이지에서 버튼 상태 제어용
                    .reporterId(rep.getReporterId())
                    .reporterNickname(rep.getReporterNickname())
                    .reason(rep.getReason())
                    .createdAt(rep.getCreatedAt())
                    .build();
        });

        return ResponseEntity.ok(dto);
    }

    /* === 댓글 숨김(=관리자 소프트 삭제) === */
    @PostMapping("/comments/{commentId}/hide")
    @Transactional
    public ResponseEntity<?> hide(
            @RequestHeader HttpHeaders headers,
            @PathVariable Long commentId,
            @RequestParam(value = "token", required = false) String tokenFromQuery
    ) {
        String token = pickToken(headers, tokenFromQuery);
        if (isBlank(token)) return ResponseEntity.status(401).body(Map.of("message", "UNAUTHORIZED_NO_TOKEN"));
        if (!isAdmin(token)) return ResponseEntity.status(403).body(Map.of("message", "FORBIDDEN"));

        int updated = courseCommentRepository.markHidden(commentId); // ✅ 삭제 대신 숨김 플래그

        return ResponseEntity.ok(Map.of(
                "commentId", commentId,
                "hidden", updated > 0
        ));
    }

    /* ===== 내부 유틸 ===== */
    private String pickToken(HttpHeaders headers, String fromQuery) {
        String authHeader  = headers.getFirst(HttpHeaders.AUTHORIZATION);
        String x1          = headers.getFirst("X-Auth-Token");
        String x2          = headers.getFirst("x-auth-token");
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) token = authHeader.substring(7);
        if (isBlank(token)) token = firstNonBlank(x1, x2);
        if (isBlank(token)) token = fromQuery;
        return token;
    }
    private boolean isAdmin(String token) {
        try {
            jwtUtil.validateTokenAndGetUserId(token);
            String role = jwtUtil.getRoleFromToken(token);
            String r = role != null ? role.toUpperCase() : "";
            return "ADMIN".equals(r) || "ROLE_ADMIN".equals(r);
        } catch (Exception e) { return false; }
    }
    private static boolean isBlank(String s) {
        return s == null || s.isBlank() || "null".equalsIgnoreCase(s) || "undefined".equalsIgnoreCase(s);
    }
    private static String firstNonBlank(String... vals) {
        if (vals == null) return null;
        for (String v : vals) if (!isBlank(v)) return v;
        return null;
    }
}
