package kr.co.pib.controller;

import kr.co.pib.dto.*;
import kr.co.pib.entity.User;
import kr.co.pib.repository.UserRepository;
import kr.co.pib.service.CommentReportService;
import kr.co.pib.service.CourseCommentService;
import kr.co.pib.service.CourseRatingService;
import kr.co.pib.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/course")
@CrossOrigin(origins = "http://localhost")
public class CourseInteractionController {

    private final CourseCommentService commentService;
    private final CourseRatingService ratingService;
    private final UserRepository userRepository;
    private final CommentReportService commentReportService;
    private final JwtUtil jwtUtil;

    /** 댓글 목록 */
    @GetMapping("/{courseId}/comments")
    public ResponseEntity<Page<CommentDto>> listComments(@PathVariable Long courseId,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(commentService.list(courseId, page, size));
    }

    /** 댓글 등록 (USER) */
    @PostMapping(value = "/{courseId}/comments", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createComment(@PathVariable Long courseId,
                                           @RequestBody NewCommentReq req,
                                           Authentication authentication) {
        Long userId = resolveUid(authentication);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!hasRoleUser(authentication)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        commentService.create(courseId, userId, req);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /** 댓글 수정 (USER + 본인만) */
    @PutMapping(value = "/{courseId}/comments/{commentId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> editComment(@PathVariable Long courseId,
                                         @PathVariable Long commentId,
                                         @RequestBody UpdateCommentReq req,
                                         Authentication authentication) {
        Long userId = resolveUid(authentication);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!hasRoleUser(authentication)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        commentService.update(courseId, commentId, userId, req);
        return ResponseEntity.ok().build();
    }

    /** 댓글 삭제 (USER + 본인만) */
    @DeleteMapping("/{courseId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long courseId,
                                           @PathVariable Long commentId,
                                           Authentication authentication) {
        Long userId = resolveUid(authentication);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!hasRoleUser(authentication)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        commentService.delete(courseId, commentId, userId);
        return ResponseEntity.ok().build();
    }

    /** 별점 요약 */
    @GetMapping("/{courseId}/rating")
    public ResponseEntity<RatingSummaryDto> getRating(@PathVariable Long courseId,
                                                      Authentication authentication) {
        Long userId = resolveUid(authentication);
        return ResponseEntity.ok(ratingService.summary(courseId, userId));
    }

    /** 별점 등록/수정 */
    @PostMapping(value = "/{courseId}/rating", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> rate(@PathVariable Long courseId,
                                  @RequestBody NewRatingReq req,
                                  Authentication authentication) {
        Long userId = resolveUid(authentication);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!hasRoleUser(authentication)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        ratingService.upsert(courseId, userId, req);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /* ===== 내부 유틸 ===== */

    private Long resolveUid(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return null;
        String principal = String.valueOf(authentication.getPrincipal()); // JwtFilter가 UID 문자열로 세팅
        try {
            return Long.valueOf(principal);
        } catch (NumberFormatException ignore) {
            Optional<User> userOpt = userRepository.findById(principal);
            return userOpt.map(User::getUid).orElse(null);
        }
    }

    private boolean hasRoleUser(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_USER".equals(a.getAuthority()));
    }

    /** 댓글 신고 (USER만, 본인 제외는 서비스단에서 검증) */
    @PostMapping(
            value = "/{courseId}/comments/{commentId}/report",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> report(@PathVariable Long courseId,
                                    @PathVariable Long commentId,
                                    @RequestBody(required = false) ReportRequest req,
                                    @RequestHeader HttpHeaders headers,
                                    @RequestParam(value = "token", required = false) String tokenParam) {

        // 0) SecurityContext에 인증이 있으면 우선 사용
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && hasRoleUser(auth)) {
            Long reporterId = resolveUid(auth);
            if (reporterId != null) {
                try {
                    // ✅ UID → 닉네임 조회 후 전달
                    String reporterNickname = userRepository.findByUid(reporterId)
                            .map(User::getNickname)
                            .orElse(null);

                    long count = commentReportService.report(
                            courseId, commentId, reporterId, reporterNickname, req);

                    return ResponseEntity.ok(Map.of(
                            "commentId", commentId,
                            "courseId", courseId,
                            "reportCount", count,
                            "message", "REPORTED",
                            "_via", "authentication"
                    ));
                } catch (IllegalArgumentException ie) {
                    return ResponseEntity.badRequest().body(Map.of("message", ie.getMessage()));
                } catch (Exception e) {
                    log.error("report error(auth path)", e);
                    return ResponseEntity.internalServerError().body(Map.of(
                            "message", "REPORT_FAILED",
                            "_debug", e.getClass().getSimpleName() + ": " + String.valueOf(e.getMessage())
                    ));
                }
            }
        }

        // 1) 헤더/쿼리/바디에서 토큰 추출
        String authHeader  = headers.getFirst(HttpHeaders.AUTHORIZATION);
        String xAuthToken1 = headers.getFirst("X-Auth-Token");
        String xAuthToken2 = headers.getFirst("x-auth-token");
        String bodyToken   = (req != null ? req.getToken() : null);

        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) token = authHeader.substring(7);
        if (isBlank(token)) token = firstNonBlank(xAuthToken1, xAuthToken2);
        if (isBlank(token)) token = firstNonBlank(tokenParam, bodyToken);

        if (isBlank(token)) {
            return ResponseEntity.status(401).body(Map.of(
                    "message", "UNAUTHORIZED_NO_TOKEN",
                    "_debug", Map.of(
                            "hasAuthHeader", authHeader != null,
                            "hasXAuthToken", (xAuthToken1 != null || xAuthToken2 != null),
                            "hasBodyToken",  bodyToken != null,
                            "hasQueryToken", tokenParam != null
                    )
            ));
        }

        // 2) 토큰 검증 & 역할 확인 (USER만)
        final String userIdStr;
        final String role;
        try {
            userIdStr = jwtUtil.validateTokenAndGetUserId(token); // "6" or "lee"
            role      = jwtUtil.getRoleFromToken(token);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "INVALID_TOKEN"));
        }
        String r = (role != null ? role.toUpperCase() : "");
        if (!"USER".equals(r) && !"ROLE_USER".equals(r)) {
            return ResponseEntity.status(403).body(Map.of("message", "FORBIDDEN"));
        }

        // 3) reporterId를 UID로 변환 + 닉네임 조회
        Long reporterId = null;
        try {
            reporterId = Long.valueOf(userIdStr);
        } catch (NumberFormatException ignore) {
            reporterId = userRepository.findById(userIdStr)
                    .map(User::getUid)
                    .orElse(null);
        }
        if (reporterId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "INVALID_PRINCIPAL"));
        }

        // ✅ UID → 닉네임 조회
        String reporterNickname = userRepository.findByUid(reporterId)
                .map(User::getNickname)
                .orElse(null);

        // 4) 신고 처리
        try {
            long count = commentReportService.report(
                    courseId, commentId, reporterId, reporterNickname, req);
            return ResponseEntity.ok(Map.of(
                    "commentId", commentId,
                    "courseId", courseId,
                    "reportCount", count,
                    "message", "REPORTED",
                    "_via", "token"
            ));
        } catch (IllegalArgumentException ie) {
            return ResponseEntity.badRequest().body(Map.of("message", ie.getMessage()));
        } catch (Exception e) {
            log.error("report error(token path)", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "REPORT_FAILED",
                    "_debug", Map.of(
                            "ex", e.getClass().getSimpleName(),
                            "msg", String.valueOf(e.getMessage()),
                            "reporterId", reporterId,
                            "courseId", courseId,
                            "commentId", commentId
                    )
            ));
        }
    }

    /* 유틸 */
    private static boolean isBlank(String s) {
        return s == null || s.isBlank() || "undefined".equalsIgnoreCase(s) || "null".equalsIgnoreCase(s);
    }
    private static String firstNonBlank(String... vals) {
        if (vals == null) return null;
        for (String v : vals) if (!isBlank(v)) return v;
        return null;
    }
}
