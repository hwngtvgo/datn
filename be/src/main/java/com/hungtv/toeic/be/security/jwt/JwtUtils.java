package com.hungtv.toeic.be.security.jwt;

import java.security.Key;
import java.time.Duration;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expirationMs}")
    private int jwtExpirationMs;

    @Value("${app.jwt.cookieName}")
    private String jwtCookie;

    @Value("${app.jwt.refreshCookieName}")
    private String jwtRefreshCookie;

    @Value("${app.cookie.domain:}")
    private String cookieDomain;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.sameSite:lax}")
    private String cookieSameSite;

    public String getJwtFromCookies(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, jwtCookie);
        if (cookie != null) {
            return cookie.getValue();
        } else {
            return null;
        }
    }

    public String getJwtRefreshFromCookies(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, jwtRefreshCookie);
        if (cookie != null) {
            return cookie.getValue();
        } else {
            return null;
        }
    }

    public ResponseCookie generateJwtCookie(String jwt) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(jwtCookie, jwt)
                .maxAge(Duration.ofSeconds(jwtExpirationMs / 1000))
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .sameSite(cookieSameSite);
        
        // Chỉ set domain nếu được cấu hình
        if (cookieDomain != null && !cookieDomain.trim().isEmpty()) {
            builder.domain(cookieDomain);
        }
        
        return builder.build();
    }

    public ResponseCookie generateRefreshJwtCookie(String refreshToken) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(jwtRefreshCookie, refreshToken)
                .maxAge(Duration.ofDays(30))
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .sameSite(cookieSameSite);
        
        // Chỉ set domain nếu được cấu hình
        if (cookieDomain != null && !cookieDomain.trim().isEmpty()) {
            builder.domain(cookieDomain);
        }
        
        return builder.build();
    }

    public ResponseCookie getCleanJwtCookie() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(jwtCookie, "")
                .maxAge(0)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .sameSite(cookieSameSite);
        
        // Chỉ set domain nếu được cấu hình
        if (cookieDomain != null && !cookieDomain.trim().isEmpty()) {
            builder.domain(cookieDomain);
        }
        
        return builder.build();
    }

    public ResponseCookie getCleanRefreshJwtCookie() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(jwtRefreshCookie, "")
                .maxAge(0)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .sameSite(cookieSameSite);
        
        // Chỉ set domain nếu được cấu hình
        if (cookieDomain != null && !cookieDomain.trim().isEmpty()) {
            builder.domain(cookieDomain);
        }
        
        return builder.build();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Token JWT không hợp lệ: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("Token JWT đã hết hạn: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Token JWT không được hỗ trợ: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Chuỗi claims JWT trống: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi không xác định khi xác thực JWT: {}", e.getMessage());
        }

        return false;
    }

    public String generateTokenFromUsername(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }
} 