package kr.co.pib.controller;

import kr.co.pib.dto.UserDetailDTO;
import kr.co.pib.dto.UserSummaryDTO;
import kr.co.pib.service.AdminUserService;
import kr.co.pib.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/open/users")
@CrossOrigin(origins = "http://localhost")
public class AdminUserOpenController {

    private final JwtUtil jwtUtil;
    private final AdminUserService adminUserService;

    /** ✅ 활성 회원 목록 */
    @GetMapping
    public ResponseEntity<?> list(
            @RequestHeader HttpHeaders headers,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(value = "token", required = false) String tokenFromQuery
    ) {
        String token = pickToken(headers, tokenFromQuery);
        if (isBlank(token)) return ResponseEntity.status(401).body(Map.of("message", "UNAUTHORIZED_NO_TOKEN"));
        if (!isAdmin(token)) return ResponseEntity.status(403).body(Map.of("message", "FORBIDDEN"));

        Page<UserSummaryDTO> dto = adminUserService.findUsers(page, size);
        return ResponseEntity.ok(dto);
    }

    /** ✅ 활성 회원 상세 */
    @GetMapping("/{uid}")
    public ResponseEntity<?> detail(
            @RequestHeader HttpHeaders headers,
            @PathVariable Long uid,
            @RequestParam(value = "token", required = false) String tokenFromQuery
    ) {
        String token = pickToken(headers, tokenFromQuery);
        if (isBlank(token)) return ResponseEntity.status(401).body(Map.of("message", "UNAUTHORIZED_NO_TOKEN"));
        if (!isAdmin(token)) return ResponseEntity.status(403).body(Map.of("message", "FORBIDDEN"));

        UserDetailDTO dto = adminUserService.findUserDetail(uid);
        return ResponseEntity.ok(dto);
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
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                boolean has = auth.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .anyMatch(a -> "ROLE_ADMIN".equalsIgnoreCase(a));
                if (has) return true;
            }
            jwtUtil.validateTokenAndGetUserId(token);
            String role = jwtUtil.getRoleFromToken(token);
            if (role == null) return false;
            String r = role.trim().toUpperCase();
            return "ADMIN".equals(r) || "ROLE_ADMIN".equals(r);
        } catch (Exception e) {
            return false;
        }
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
