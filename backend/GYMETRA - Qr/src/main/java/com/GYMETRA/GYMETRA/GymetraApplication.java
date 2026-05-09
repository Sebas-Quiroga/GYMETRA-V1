package com.GYMETRA.GYMETRA;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GymetraApplication {

	public static void main(String[] args) {
		SpringApplication.run(GymetraApplication.class, args);
	}

}
