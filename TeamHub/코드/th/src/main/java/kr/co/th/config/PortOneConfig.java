package kr.co.th.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "portone.api")
public class PortOneConfig {
    private String key;
    private String secret;
}
