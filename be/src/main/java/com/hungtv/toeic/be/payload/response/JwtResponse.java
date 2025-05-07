package com.hungtv.toeic.be.payload.response;

import java.util.List;
import java.util.Objects;

public class JwtResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private List<String> roles;
    private String accessToken;
    private String tokenType = "Bearer";
    
    // Constructors
    public JwtResponse() {
    }
    
    public JwtResponse(Long id, String username, String email, String fullName, List<String> roles, String accessToken, String tokenType) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
        this.accessToken = accessToken;
        this.tokenType = tokenType;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public List<String> getRoles() {
        return roles;
    }
    
    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
    
    public String getAccessToken() {
        return accessToken;
    }
    
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
    
    public String getTokenType() {
        return tokenType;
    }
    
    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }
    
    // equals, hashCode và toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        JwtResponse that = (JwtResponse) o;
        return Objects.equals(id, that.id) &&
               Objects.equals(username, that.username) &&
               Objects.equals(email, that.email) &&
               Objects.equals(fullName, that.fullName) &&
               Objects.equals(roles, that.roles) &&
               Objects.equals(accessToken, that.accessToken) &&
               Objects.equals(tokenType, that.tokenType);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id, username, email, fullName, roles, accessToken, tokenType);
    }
    
    @Override
    public String toString() {
        return "JwtResponse{" +
               "id=" + id +
               ", username='" + username + '\'' +
               ", email='" + email + '\'' +
               ", fullName='" + fullName + '\'' +
               ", roles=" + roles +
               ", accessToken='" + accessToken + '\'' +
               ", tokenType='" + tokenType + '\'' +
               '}';
    }
}