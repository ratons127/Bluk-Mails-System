package com.example.bulkemail.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

public class AuthDtos {
    @Data
    public static class LoginRequest {
        @Email
        @NotBlank
        @Schema(example = "admin@company.com")
        private String email;

        @NotBlank
        private String password;
    }

    @Data
    public static class LoginResponse {
        private String token;
        private UserResponse user;
    }

    @Data
    public static class ForgotPasswordRequest {
        @Email
        @NotBlank
        private String email;
    }

    @Data
    public static class ResetPasswordRequest {
        @NotBlank
        private String token;

        @NotBlank
        private String newPassword;
    }

    @Data
    public static class UserCreateRequest {
        @Email
        @NotBlank
        private String email;

        @NotBlank
        private String fullName;

        @NotBlank
        private String password;

        private Set<String> roles;
    }

    @Data
    public static class UserUpdateRequest {
        private String fullName;
        private Boolean active;
        private Set<String> roles;
    }

    @Data
    public static class UserResponse {
        private Long id;
        private String email;
        private String fullName;
        private boolean active;
        private Set<String> roles;
    }
}
