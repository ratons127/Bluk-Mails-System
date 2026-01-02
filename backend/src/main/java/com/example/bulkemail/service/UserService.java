package com.example.bulkemail.service;

import com.example.bulkemail.dto.AuthDtos;
import com.example.bulkemail.entity.AppUser;
import com.example.bulkemail.entity.PasswordResetToken;
import com.example.bulkemail.repo.AppUserRepository;
import com.example.bulkemail.repo.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class UserService {
    private final AppUserRepository appUserRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final NotificationService notificationService;
    private final String resetBaseUrl;

    public UserService(AppUserRepository appUserRepository,
                       PasswordResetTokenRepository resetTokenRepository,
                       NotificationService notificationService,
                       @Value("${app.notification.reset-base-url:http://localhost:5173/reset-password}") String resetBaseUrl) {
        this.appUserRepository = appUserRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.notificationService = notificationService;
        this.resetBaseUrl = resetBaseUrl;
    }

    public AppUser authenticate(String email, String password) {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!user.isActive() || !encoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        user.setLastLoginAt(Instant.now());
        appUserRepository.save(user);
        notificationService.sendLoginNotice(user.getEmail());
        return user;
    }

    public AuthDtos.UserResponse create(AuthDtos.UserCreateRequest request) {
        AppUser user = new AppUser();
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPasswordHash(encoder.encode(request.getPassword()));
        user.setRoles(request.getRoles() != null ? request.getRoles() : Set.of("SENDER"));
        user.setActive(true);
        user.setCreatedAt(Instant.now());
        AppUser saved = appUserRepository.save(user);
        return toResponse(saved);
    }

    public AuthDtos.UserResponse update(Long id, AuthDtos.UserUpdateRequest request) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            user.setRoles(request.getRoles());
        }
        user.setUpdatedAt(Instant.now());
        return toResponse(appUserRepository.save(user));
    }

    public void delete(Long id) {
        appUserRepository.deleteById(id);
    }

    public List<AuthDtos.UserResponse> list() {
        return appUserRepository.findAll().stream().map(this::toResponse).toList();
    }

    public boolean hasAnyUser() {
        return appUserRepository.count() > 0;
    }

    public void requestPasswordReset(String email) {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setCreatedAt(Instant.now());
        token.setExpiresAt(Instant.now().plus(2, ChronoUnit.HOURS));
        resetTokenRepository.save(token);
        String link = resetBaseUrl + "?token=" + token.getToken();
        notificationService.sendPasswordReset(user.getEmail(), link);
    }

    public void resetPassword(String tokenValue, String newPassword) {
        PasswordResetToken token = resetTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));
        if (token.getUsedAt() != null || token.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Token expired");
        }
        AppUser user = token.getUser();
        user.setPasswordHash(encoder.encode(newPassword));
        user.setUpdatedAt(Instant.now());
        appUserRepository.save(user);
        token.setUsedAt(Instant.now());
        resetTokenRepository.save(token);
    }

    public AuthDtos.UserResponse toResponse(AppUser user) {
        AuthDtos.UserResponse response = new AuthDtos.UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setActive(user.isActive());
        response.setRoles(user.getRoles());
        return response;
    }
}
