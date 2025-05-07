package com.hungtv.toeic.be.security.jwt;

import com.hungtv.toeic.be.security.services.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.security.Key;
import java.util.Date;

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

    public ResponseCookie generateJwtCookie(UserDetailsImpl userPrincipal) {
        String jwt = generateTokenFromUsername(userPrincipal.getUsername());
        ResponseCookie cookie = ResponseCookie.from(jwtCookie, jwt)
                .path("/")
                .maxAge(24 * 60 * 60)
                .httpOnly(true)
                .secure(false) // Đặt thành true trong môi trường sản xuất với HTTPS
                .sameSite("Lax") // Thay đổi từ Strict sang Lax để phù hợp với các yêu cầu cross-site
                .build();
        return cookie;
    }

    public ResponseCookie generateRefreshJwtCookie(String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from(jwtRefreshCookie, refreshToken)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .build();
        return cookie;
    }

    public ResponseCookie getCleanJwtCookie() {
        ResponseCookie cookie = ResponseCookie.from(jwtCookie, "")
                .path("/")
                .maxAge(0)
                .build();
        return cookie;
    }

    public ResponseCookie getCleanJwtRefreshCookie() {
        ResponseCookie cookie = ResponseCookie.from(jwtRefreshCookie, "")
                .path("/")
                .maxAge(0)
                .build();
        return cookie;
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