package com.CompraXApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling 
public class CompraXAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(CompraXAppApplication.class, args);
    }

}
