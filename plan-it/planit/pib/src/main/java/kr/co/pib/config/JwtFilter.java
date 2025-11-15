package kr.co.pib.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import kr.co.pib.repository.UserRepository;
import kr.co.pib.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtFilter implements Filter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;

        String authHeader   = req.getHeader("Authorization");
        String xAuth1       = req.getHeader("X-Auth-Token");
        String xAuth2       = req.getHeader("x-auth-token");
        String queryToken   = req.getParameter("token");

        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) token = authHeader.substring(7);
        if (isBlank(token)) token = firstNonBlank(xAuth1, xAuth2);
        if (isBlank(token)) token = queryToken;

        try {
            if (!isBlank(token)) {
                String subject = jwtUtil.validateTokenAndGetUserId(token); // "admin" 또는 "7"
                String role    = jwtUtil.getRoleFromToken(token);          // "ADMIN" / "ROLE_ADMIN" 등
                if (subject != null && role != null) {
                    boolean numeric = subject.matches("\\d+");

                    Long uid = numeric
                            ? Long.valueOf(subject)
                            : userRepository.findById(subject).map(u -> u.getUid()).orElse(null);

                    String loginId = numeric
                            ? userRepository.findByUid(uid).map(u -> u.getId()).orElse(null)
                            : subject;

                    if (uid != null && loginId != null) {
                        String springRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;

                        var auth = new UsernamePasswordAuthenticationToken(
                                loginId,
                                uid,
                                List.of(new SimpleGrantedAuthority(springRole))
                        );

                        String nickname = null;
                        try { nickname = jwtUtil.getNicknameFromToken(token); } catch (Exception ignored) {}
                        auth.setDetails(Map.of("uid", uid, "role", springRole, "nickname", nickname));

                        SecurityContextHolder.getContext().setAuthentication(auth);
                    } else {
                        SecurityContextHolder.clearContext();
                    }
                }
            }
        } catch (Exception ex) {
            SecurityContextHolder.clearContext();
        }

        chain.doFilter(request, response);
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
