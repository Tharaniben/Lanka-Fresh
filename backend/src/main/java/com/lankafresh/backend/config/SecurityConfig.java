package com.lankafresh.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configures Spring Security for the entire application.
 *
 * Key decisions made here:
 * - Stateless sessions (no server-side session — each request carries its own JWT)
 * - All /api/v1/** endpoints require authentication
 * - JWT is verified against Clerk's public key fetched from CLERK_JWKS_URL
 *   (set in your .env file — never hardcode the URL here)
 * - JwtUserFilter runs after JWT verification to load the local User + role
 * - @PreAuthorize is enabled so controllers can use role checks like:
 *   @PreAuthorize("hasRole('INVENTORY_STAFF')")
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity          // enables @PreAuthorize on controller methods
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUserFilter jwtUserFilter;

    @Value("${clerk.jwks.url}")
    private String jwksUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — not needed for a stateless JWT API
            .csrf(AbstractHttpConfigurer::disable)

            // Stateless — no session cookies, every request must carry a JWT
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Endpoint access rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — no JWT needed
                .requestMatchers("/actuator/health").permitAll()
                // Everything else requires a valid Clerk JWT
                .anyRequest().authenticated()
            )

            // Tell Spring Security to verify JWTs using Clerk's public key
            .oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwt -> jwt.decoder(jwtDecoder())))

            // Run our custom filter after JWT verification — it loads the
            // local User and sets the role-based authority
            .addFilterAfter(jwtUserFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Fetches Clerk's public key from the JWKS URL and uses it to verify
     * every incoming JWT signature. Spring caches this key — it does NOT
     * call Clerk on every request, only when the key needs refreshing.
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri(jwksUrl).build();
    }
}
