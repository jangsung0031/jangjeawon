// src/main/java/kr/co/pib/config/AdminAuthChecker.java
package kr.co.pib.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("adminAuthChecker")
public class AdminAuthChecker {
    public boolean hasAdminAuthorityIgnoreCase() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equalsIgnoreCase(a.getAuthority()));
    }
}
