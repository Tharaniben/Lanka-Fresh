package com.lankafresh.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Allows the React dev server (Vite, default port 5173) to call this API
 * during local development.
 *
 * Spring Security also has its own CORS config — both must allow the same
 * origins or you'll get CORS errors on authenticated requests. The Security
 * config delegates to this MVC CORS config via .cors(Customizer.withDefaults())
 * so you only need to update origins in one place: here.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
