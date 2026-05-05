package com.hotel.booking.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        logger.info("JWT FILTER EXECUTED FOR: {}", request.getRequestURI());
        
        String authHeader = request.getHeader("Authorization");
        logger.info("Authorization header: {}", authHeader != null ? "PRESENT" : "MISSING");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String tokenPreview = token.length() > 20 ? token.substring(0, 20) + "..." : token;
            logger.info("Token extracted: {}", tokenPreview);
            
            boolean isValid = jwtUtil.validateToken(token);
            logger.info("Token valid: {}", isValid);
            
            if (isValid) {
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                
                logger.info("Username: {}", username);
                logger.info("Role from token: {}", role);

                List<SimpleGrantedAuthority> authorities =
                        List.of(new SimpleGrantedAuthority("ROLE_" + role));
                
                logger.info("Authorities created: {}", authorities);

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                logger.info("Authentication set: YES");
            } else {
                logger.info("Authentication set: NO (invalid token)");
            }
        } else {
            logger.info("Authentication set: NO (no Bearer token)");
        }

        filterChain.doFilter(request, response);
    }
}
