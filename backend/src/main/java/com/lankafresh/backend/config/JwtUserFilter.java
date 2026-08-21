package com.lankafresh.backend.config;

import com.lankafresh.backend.user.model.User;
import com.lankafresh.backend.user.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Runs after Spring Security has already verified the JWT signature.
 * Its job is to:
 *  1. Read the Clerk user ID ('sub' claim) from the verified JWT
 *  2. Look up (or just-in-time create) the local User row in MySQL
 *  3. Replace the generic JWT authentication with one that carries the
 *     local role (e.g. ROLE_INVENTORY_STAFF) so @PreAuthorize works
 *
 * This filter runs once per request and is registered in SecurityConfig.
 * You never need to call it directly — Spring calls it automatically.
 */
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

        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();

            // Extract claims from the Clerk JWT
            String clerkId  = jwt.getSubject();                         // "sub" — always present
            String email     = jwt.getClaimAsString("email");           // from Clerk session
            String firstName = jwt.getClaimAsString("first_name");      // from Clerk session
            String lastName  = jwt.getClaimAsString("last_name");       // from Clerk session

            // JIT: find existing user or create a new CUSTOMER row
            User user = userService.findOrCreate(clerkId, email, firstName, lastName);

            // Build a Spring Security authority from the local role
            // Spring expects "ROLE_" prefix for @PreAuthorize("hasRole('...')")
            String authority = "ROLE_" + user.getRole().name();
            List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(authority));

            // Replace authentication with one that carries the local role
            JwtAuthenticationToken enriched = new JwtAuthenticationToken(jwt, authorities);
            SecurityContextHolder.getContext().setAuthentication(enriched);

            // Store the full User object in the request so controllers can
            // access it without another DB call: request.getAttribute("currentUser")
            request.setAttribute("currentUser", user);
        }

        filterChain.doFilter(request, response);
    }
}
