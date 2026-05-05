package com.hotel.booking.config;

import com.hotel.booking.security.JwtAuthenticationFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow CORS preflight + Spring infrastructure paths
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/actuator/**", "/error").permitAll()
                // Public auth paths (defensive — auth lives in the auth-service)
                .requestMatchers("/auth/**").permitAll()
                // Authenticated business endpoints
                .requestMatchers("/hotels/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/bookings/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/admin/**").access((authentication, requestContext) -> {
                    String path = requestContext.getRequest().getRequestURI();
                    logger.info("SECURITY CHECK - Request path: {}", path);
                    logger.info("SECURITY CHECK - Endpoint matches /admin/**: {}", path.startsWith("/admin/"));
                    logger.info("SECURITY CHECK - Required role: ADMIN");
                    
                    Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
                    if (currentAuth != null) {
                        logger.info("SECURITY CHECK - Current user: {}", currentAuth.getName());
                        logger.info("SECURITY CHECK - User authorities: {}", currentAuth.getAuthorities());
                    } else {
                        logger.info("SECURITY CHECK - No authentication found in context");
                    }
                    
                    boolean hasAdminRole = currentAuth != null && currentAuth.getAuthorities().stream()
                            .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
                    
                    logger.info("SECURITY CHECK - Access decision: {}", hasAdminRole ? "GRANTED" : "DENIED");
                    
                    return new org.springframework.security.authorization.AuthorizationDecision(hasAdminRole);
                })
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
