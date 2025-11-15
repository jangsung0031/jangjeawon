// src/main/java/kr/co/pib/config/SecurityConfig.java
package kr.co.pib.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .httpBasic(b -> b.disable())
                .csrf(c -> c.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()

                        // ✅ open 경로는 컨트롤러에서 토큰/권한 다시 확인 (순서: admin/** 보다 위!)
                        .requestMatchers("/api/admin/open/**").permitAll()

                        // USER/ADMIN 공용
                        .requestMatchers(
                                "/api/tour/detail/user/**",
                                "/api/my-course/**"
                        ).hasAnyRole("USER","ADMIN")

                        .requestMatchers("/api/my-tour-courses/**").hasAnyRole("USER", "ADMIN")

                        .requestMatchers("/api/users/**").hasAnyRole("USER", "ADMIN")

                        // ADMIN 전용 (대소문자 무시)
                        .requestMatchers("/api/admin/**")
                        .access((authentication, context) -> {
                            boolean ok = authentication.get().getAuthorities().stream()
                                    .anyMatch(a -> "ROLE_ADMIN".equalsIgnoreCase(a.getAuthority()));
                            return new AuthorizationDecision(ok);
                        })


                        // 공개 API
                        .requestMatchers(
                                "/static/images/**",
                                "/api/auth/**",
                                "/api/sms/**",
                                "/api/user/find-id",
                                "/api/user/reset-password",
                                "/festival-img/**",
                                "/api/festival/**",
                                "/api/tour/**",
                                "/api/kcisa/**",
                                "/api/course/**"
                        ).permitAll()

                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean public AuthenticationManager authenticationManager(AuthenticationConfiguration c) throws Exception {
        return c.getAuthenticationManager();
    }

    @Bean
    public RestTemplate restTemplate() {
        var factory = new HttpComponentsClientHttpRequestFactory();
        var rest = new RestTemplate(factory);
        ClientHttpRequestInterceptor ua = (req, body, ex) -> {
            req.getHeaders().add("User-Agent", "Mozilla/5.0");
            return ex.execute(req, body);
        };
        rest.setInterceptors(Collections.singletonList(ua));
        return rest;
    }
}
