package com.lankafresh.backend.config;

import com.lankafresh.backend.user.model.User;
import com.lankafresh.backend.user.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtUserFilter extends OncePerRequestFilter {

    private final UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.debug("JwtUserFilter running — auth type: {}", auth == null ? "null" : auth.getClass().getSimpleName());

        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();

            String clerkId  = jwt.getSubject();
            String email    = jwt.getClaimAsString("email");
            String firstName = jwt.getClaimAsString("first_name");
            String lastName  = jwt.getClaimAsString("last_name");

            log.info("JwtUserFilter — clerkId: {}, email: {}, firstName: {}, lastName: {}",
                    clerkId, email, firstName, lastName);

            try {
                User user = userService.findOrCreate(clerkId, email, firstName, lastName);
                log.info("JwtUserFilter — user created/found: id={}, role={}", user.getId(), user.getRole());

                String authority = "ROLE_" + user.getRole().name();
                List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(authority));
                JwtAuthenticationToken enriched = new JwtAuthenticationToken(jwt, authorities);
                SecurityContextHolder.getContext().setAuthentication(enriched);
                request.setAttribute("currentUser", user);

            } catch (Exception e) {
                log.error("JwtUserFilter — failed to create/find user: {}", e.getMessage(), e);
            }
        } else {
            log.debug("JwtUserFilter — no JWT auth found, skipping");
        }

        filterChain.doFilter(request, response);
    }
}
