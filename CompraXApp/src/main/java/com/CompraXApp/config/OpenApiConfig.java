package com.CompraXApp.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
        
               
                .info(new Info()
                        .title("CompraXApp API")
                        .description("API para la aplicación CompraXApp - Session Auth")
                        .version("1.0"));
    }
}