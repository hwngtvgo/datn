package com.hungtv.toeic.be.payload.response;

import java.util.Objects;

public class UserStatusResponse {
    private String username;
    private boolean authenticated;
    private String role;
    
    public UserStatusResponse() {
    }
    
    public UserStatusResponse(String username, boolean authenticated, String role) {
        this.username = username;
        this.authenticated = authenticated;
        this.role = role;
    }
    
    // Getter/Setter
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public boolean isAuthenticated() {
        return authenticated;
    }
    
    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    // equals, hashCode và toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserStatusResponse that = (UserStatusResponse) o;
        return authenticated == that.authenticated &&
               Objects.equals(username, that.username) &&
               Objects.equals(role, that.role);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(username, authenticated, role);
    }
    
    @Override
    public String toString() {
        return "UserStatusResponse{" +
               "username='" + username + '\'' +
               ", authenticated=" + authenticated +
               ", role='" + role + '\'' +
               '}';
    }
}