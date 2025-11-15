package kr.co.pib.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/festival-img/**")
                .addResourceLocations("file:///C:/festivalimg/") // ★ 끝에 / 필수, 슬래시 3개
                .setCachePeriod(0);
    }
}
