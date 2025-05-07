package com.hungtv.toeic.be.repositories;

import com.hungtv.toeic.be.models.PasswordResetToken;
import com.hungtv.toeic.be.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    
    Optional<PasswordResetToken> findByUser(User user);
    
    void deleteByExpiryDateBefore(LocalDateTime now);
} 