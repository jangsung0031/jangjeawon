package kr.co.pib;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class PibApplication {

	public static void main(String[] args) {
		SpringApplication.run(PibApplication.class, args);
	}

}
