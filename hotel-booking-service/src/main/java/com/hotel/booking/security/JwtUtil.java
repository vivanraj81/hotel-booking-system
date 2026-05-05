package com.hotel.booking.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET is not configured");
        }
        String maskedSecret = secret.length() > 8 ? secret.substring(0, 4) + "****" + secret.substring(secret.length() - 4) : "****";
        logger.debug("JWT Secret key (masked): {}", maskedSecret);
        return Keys.hmacShaKeyFor(java.util.Base64.getDecoder().decode(secret));
    }

    public Claims parseToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            logger.debug("JWT signature validation: PASSED");
            return claims;
        } catch (Exception e) {
            logger.error("JWT signature validation: FAILED - {}", e.getMessage());
            throw e;
        }
    }

    public String extractUsername(String token) {
        return parseToken(token).getSubject();
    }

    public String extractRole(String token) {
        return parseToken(token).get("role", String.class);
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            logger.debug("Token validation: SUCCESS");
            return true;
        } catch (Exception e) {
            logger.error("Token validation: FAILED - {}", e.getMessage());
            return false;
        }
    }
}
