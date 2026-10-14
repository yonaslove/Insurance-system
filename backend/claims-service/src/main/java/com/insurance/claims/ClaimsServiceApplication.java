package com.insurance.claims;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ClaimsServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClaimsServiceApplication.class, args);
    }
}
