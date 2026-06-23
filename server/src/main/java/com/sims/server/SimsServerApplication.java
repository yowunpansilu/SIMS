package com.sims.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SimsServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SimsServerApplication.class, args);
    }
}
