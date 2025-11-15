// src/main/java/kr/co/pib/config/CorsConfig.java
package kr.co.pib.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.*;
import org.springframework.web.servlet.config.annotation.*;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();

        // ★ 포트 유무 모두 허용 (중요)
        cfg.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost",
                "http://127.0.0.1",
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://52.78.193.2",
                "http://waypoint.o-r.kr"
        ));
        cfg.setAllowedMethods(Arrays.asList("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(Arrays.asList("Authorization","Content-Type","X-Requested-With"));
        cfg.setExposedHeaders(Arrays.asList("Authorization","Location"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns(
                                "http://localhost",
                                "http://127.0.0.1",
                                "http://localhost:*",
                                "http://127.0.0.1:*"
                        )
                        .allowedMethods("*")
                        .allowedHeaders("*")
                        .exposedHeaders("Authorization","Location")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
