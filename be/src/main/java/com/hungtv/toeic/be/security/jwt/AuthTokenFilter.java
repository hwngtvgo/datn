package com.hungtv.toeic.be.security.jwt;

import com.hungtv.toeic.be.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class AuthTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = jwtUtils.getJwtFromCookies(request);
            logger.debug("JWT từ cookie: {}", jwt != null ? "Có" : "Không");
            
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                logger.debug("Username từ JWT: {}", username);

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                logger.debug("Đã tải thông tin người dùng: {}", userDetails.getUsername());
                
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                logger.debug("Đã thiết lập xác thực cho: {}", username);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                logger.debug("Không có JWT hoặc JWT không hợp lệ");
            }
        } catch (Exception e) {
            logger.error("Không thể xác thực người dùng: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
} 