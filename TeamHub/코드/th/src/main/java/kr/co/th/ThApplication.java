package kr.co.th;

import kr.co.th.config.PortOneConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(PortOneConfig.class)
public class ThApplication {

	public static void main(String[] args) {
		SpringApplication.run(ThApplication.class, args);
	}

}
